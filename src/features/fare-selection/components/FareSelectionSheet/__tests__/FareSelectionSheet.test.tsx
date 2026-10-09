import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import * as api from "../../../api/bookingApi";
import { faresFixture, outboundFlight } from "../../../__fixtures__/booking";
import type { PriceChangedError } from "../../../types/booking";
import { FareSelectionSheet } from "../FareSelectionSheet";

vi.mock("../../../api/bookingApi");

const change: PriceChangedError = {
  code: "PRICE_CHANGED",
  message: "price changed",
  oldPrice: 2980,
  newPrice: 3200,
  diff: 220,
  reason: "PRICE_UPDATED",
};

function setup(
  open = true,
  flight: typeof outboundFlight | null = outboundFlight,
) {
  const onSelected = vi.fn();
  const onPriceChanged = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <FareSelectionSheet
      open={open}
      onOpenChange={onOpenChange}
      flight={flight}
      draftId="d1"
      leg="outbound"
      onSelected={onSelected}
      onPriceChanged={onPriceChanged}
    />,
  );
  return { onSelected, onPriceChanged };
}

function cta() {
  return screen.getByRole("button", { name: "เลือก" });
}

describe("FareSelectionSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getFares).mockResolvedValue(faresFixture);
  });

  it("UI-FS-01: When the sheet opens, should load the fares of the flight and show 3 FareCards with one CTA", async () => {
    setup();
    expect(await screen.findAllByRole("radio")).toHaveLength(3);
    expect(api.getFares).toHaveBeenCalledWith("d1", "f1", expect.anything());
    expect(screen.getByText("Lite")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
    expect(screen.getByText("Flex")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "เลือก" })).toHaveLength(1);
  });

  it("UI-FS-01: While fares load, should show a loading skeleton", () => {
    vi.mocked(api.getFares).mockReturnValue(new Promise(() => {}));
    setup();
    expect(
      screen.getByRole("status", { name: "กำลังโหลดค่าโดยสาร" }),
    ).toBeInTheDocument();
  });

  it("UI-FS-01: When closed, should not load fares", () => {
    setup(false);
    expect(api.getFares).not.toHaveBeenCalled();
  });

  it("UI-FS-01: When there is no flight, should not load fares", () => {
    setup(true, null);
    expect(api.getFares).not.toHaveBeenCalled();
  });

  it("UI-FS-01: When loading fares fails, should show an error and reload on retry", async () => {
    vi.mocked(api.getFares).mockRejectedValueOnce(
      new ApiError(500, "INTERNAL", "x"),
    );
    setup();
    expect(
      await screen.findByText("โหลดค่าโดยสารไม่สำเร็จ"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }));
    expect(await screen.findAllByRole("radio")).toHaveLength(3);
  });

  it("UI-FS-02: When no fare is selected, should disable the CTA", async () => {
    setup();
    await screen.findAllByRole("radio");
    expect(cta()).toBeDisabled();
  });

  describe("when a fare is picked and the CTA is pressed", () => {
    async function pickValue() {
      await userEvent.click(
        await screen.findByRole("radio", { name: /Value/ }),
      );
      expect(cta()).toBeEnabled();
      await userEvent.click(cta());
    }

    it("UI-FS-01: When selecting succeeds, should call onSelected with flight, family and total", async () => {
      vi.mocked(api.selectFare).mockResolvedValue({
        selection: { flightId: "f1", fareFamily: "VALUE" },
        price: {
          total: 2980,
          perPax: { adult: 1490, child: 1490, infant: 300 },
        },
      });
      const { onSelected } = setup();
      await pickValue();
      expect(api.selectFare).toHaveBeenCalledWith(
        "d1",
        "outbound",
        "f1",
        "VALUE",
      );
      expect(onSelected).toHaveBeenCalledWith({
        flight: outboundFlight,
        fareFamily: "VALUE",
        total: 2980,
      });
    });

    it("UI-FS-03: When the API answers PRICE_CHANGED, should hand the error to onPriceChanged", async () => {
      vi.mocked(api.selectFare).mockRejectedValue(
        new ApiError(409, "PRICE_CHANGED", "x", undefined, { error: change }),
      );
      const { onSelected, onPriceChanged } = setup();
      await pickValue();
      expect(onPriceChanged).toHaveBeenCalledWith(change);
      expect(onSelected).not.toHaveBeenCalled();
    });

    it("UI-FS-01: When selecting fails otherwise, should show an inline error and retry", async () => {
      vi.mocked(api.selectFare)
        .mockRejectedValueOnce(new ApiError(500, "INTERNAL", "x"))
        .mockResolvedValueOnce({
          selection: { flightId: "f1", fareFamily: "VALUE" },
          price: { total: 2980, perPax: { adult: 1, child: 1, infant: 1 } },
        });
      const { onSelected } = setup();
      await pickValue();
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "เลือกค่าโดยสารไม่สำเร็จ",
      );
      await userEvent.click(
        screen.getByRole("button", { name: "ลองอีกครั้ง" }),
      );
      expect(onSelected).toHaveBeenCalledOnce();
    });

    it("UI-FS-01: When the search expired, should show nothing special", async () => {
      vi.mocked(api.selectFare).mockRejectedValue(
        new ApiError(410, "SEARCH_EXPIRED", "x"),
      );
      const { onSelected, onPriceChanged } = setup();
      await pickValue();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onSelected).not.toHaveBeenCalled();
      expect(onPriceChanged).not.toHaveBeenCalled();
    });

    it("UI-FS-01: When PRICE_CHANGED carries no error body, should treat it as a plain failure", async () => {
      vi.mocked(api.selectFare).mockRejectedValue(
        new ApiError(409, "PRICE_CHANGED", "x"),
      );
      const { onPriceChanged } = setup();
      await pickValue();
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(onPriceChanged).not.toHaveBeenCalled();
    });
  });
});
