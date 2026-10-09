import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { flightsFixture } from "../../../__fixtures__/flightResults";
import type { FlightCardDto } from "../../../types/flightResults";
import { FlightCard } from "../FlightCard";

const [cheapest, other] = flightsFixture as [FlightCardDto, FlightCardDto];

describe("FlightCard", () => {
  it("UI-FR-01: When rendered, should show flight no., airport-local times, airports, duration, stops and the per-person price incl. tax", () => {
    render(<FlightCard flight={cheapest} />);
    expect(screen.getByText("BD101")).toBeInTheDocument();
    // 00:30Z / 01:45Z are 07:30 / 08:45 in Asia/Bangkok whatever the browser timezone is.
    expect(screen.getByText("07:30")).toBeInTheDocument();
    expect(screen.getByText("08:45")).toBeInTheDocument();
    expect(screen.getByText("BKK")).toBeInTheDocument();
    expect(screen.getByText("CNX")).toBeInTheDocument();
    expect(screen.getByText("1 ชม. 15 นาที")).toBeInTheDocument();
    expect(screen.getByText("บินตรง")).toBeInTheDocument();
    expect(screen.getByText("฿1,190 ต่อท่าน รวมภาษีแล้ว")).toBeInTheDocument();
  });

  it("UI-FR-01: When the flight has stops, should show the stop count; whole-hour durations omit minutes", () => {
    render(
      <FlightCard
        flight={{ ...other, duration: 120, stops: 2, from: "SIN", to: "NRT" }}
      />,
    );
    expect(screen.getByText("2 จุดแวะ")).toBeInTheDocument();
    expect(screen.getByText("2 ชม.")).toBeInTheDocument();
  });

  it("UI-FR-01: When the duration is under an hour, should show minutes only", () => {
    render(<FlightCard flight={{ ...other, duration: 45 }} />);
    expect(screen.getByText("45 นาที")).toBeInTheDocument();
  });

  it("UI-FR-02: When the flight is the lowest, should show the lowest badge; otherwise none", () => {
    const { rerender } = render(<FlightCard flight={cheapest} />);
    expect(screen.getByText("ราคาต่ำสุด")).toBeInTheDocument();
    rerender(<FlightCard flight={other} />);
    expect(screen.queryByText("ราคาต่ำสุด")).not.toBeInTheDocument();
  });

  it.each([1, 5])(
    "UI-FR-03: When seatsLeft is %i (<= 5), should show the seats-left hint",
    (seatsLeft) => {
      render(<FlightCard flight={{ ...other, seatsLeft }} />);
      expect(
        screen.getByText(`เหลือ ${seatsLeft} ที่นั่ง`),
      ).toBeInTheDocument();
    },
  );

  it.each([6, undefined])(
    "UI-FR-03: When seatsLeft is %s (> 5 or absent), should show no hint",
    (seatsLeft) => {
      render(<FlightCard flight={{ ...other, seatsLeft }} />);
      expect(screen.queryByText(/เหลือ/)).not.toBeInTheDocument();
    },
  );

  it("UI-FS-01: When onSelect is given and the select button is pressed, should call it with the flight", async () => {
    const onSelect = vi.fn();
    render(<FlightCard flight={cheapest} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "เลือก" }));
    expect(onSelect).toHaveBeenCalledWith(cheapest);
  });

  it("UI-FS-01: When onSelect is not given, should not show a select button", () => {
    render(<FlightCard flight={cheapest} />);
    expect(
      screen.queryByRole("button", { name: "เลือก" }),
    ).not.toBeInTheDocument();
  });
});
