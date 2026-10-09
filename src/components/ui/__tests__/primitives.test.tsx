import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "../alert";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { Checkbox } from "../checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "../dialog";
import { Input } from "../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Sheet, SheetContent, SheetTitle } from "../sheet";
import { Tabs } from "../tabs";

describe("UI-FND-02 shadcn primitives follow design.md", () => {
  describe("Button", () => {
    it("When default, should be a midnight pill CTA with the CTA shadow and at least 44px tall", () => {
      render(<Button>ค้นหา</Button>);
      const button = screen.getByRole("button", { name: "ค้นหา" });
      expect(button).toHaveClass(
        "rounded-full",
        "bg-primary",
        "shadow-cta",
        "h-11",
        "font-display",
      );
    });

    it.each([
      ["secondary", "bg-secondary"],
      ["outline", "border-control-border"],
      ["ghost", "hover:bg-iris-mist"],
      ["ghost-inverse", "text-primary-foreground"],
      ["link", "text-iris"],
      ["destructive", "bg-destructive"],
    ] as const)(
      "When variant is %s, should apply its style without the CTA shadow",
      (variant, cls) => {
        render(<Button variant={variant}>x</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass(cls);
        expect(button).not.toHaveClass("shadow-cta");
      },
    );

    it("When size is sm, lg or icon, should follow the design heights; icon is at least 44px", () => {
      render(
        <>
          <Button size="sm">a</Button>
          <Button size="lg">b</Button>
          <Button size="icon" aria-label="c" />
        </>,
      );
      expect(screen.getByRole("button", { name: "a" })).toHaveClass("h-9");
      expect(screen.getByRole("button", { name: "b" })).toHaveClass("h-13");
      expect(screen.getByRole("button", { name: "c" })).toHaveClass("size-11");
    });

    it("When block is set, should be full width", () => {
      render(<Button block>x</Button>);
      expect(screen.getByRole("button")).toHaveClass("w-full");
    });
  });

  describe("Badge", () => {
    it.each([
      ["lowest", "bg-sunset-tint"],
      ["success", "bg-success"],
      ["warning", "bg-warning"],
    ] as const)(
      "When variant is %s, should use its status colours as a pill",
      (variant, cls) => {
        render(<Badge variant={variant}>ป้าย</Badge>);
        expect(screen.getByText("ป้าย")).toHaveClass(cls, "rounded-full");
      },
    );
  });

  describe("Tabs", () => {
    it("When rendered, should show a pill list whose active tab is midnight and reports changes", async () => {
      const onValueChange = vi.fn();
      render(
        <Tabs
          items={[
            { value: "one-way", label: "เที่ยวเดียว" },
            { value: "round", label: "ไป-กลับ" },
          ]}
          onValueChange={onValueChange}
        />,
      );
      expect(screen.getByRole("tablist")).toHaveClass("rounded-full");
      const first = screen.getByRole("tab", { name: "เที่ยวเดียว" });
      expect(first).toHaveAttribute("aria-selected", "true");
      expect(first).toHaveClass("data-active:bg-midnight");
      await userEvent.click(screen.getByRole("tab", { name: "ไป-กลับ" }));
      expect(onValueChange).toHaveBeenCalledWith("round");
    });

    it("When controlled, should show the given value", () => {
      render(
        <Tabs
          items={[
            { value: "a", label: "เอ" },
            { value: "b", label: "บี" },
          ]}
          value="b"
        />,
      );
      expect(screen.getByRole("tab", { name: "บี" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  describe("Input", () => {
    it("When given label and hint, should be 44px tall with a linked label and description", () => {
      render(<Input label="ชื่อ" hint="ตามพาสปอร์ต" />);
      const input = screen.getByLabelText("ชื่อ");
      expect(input).toHaveClass("h-11", "rounded-sm", "border-control-border");
      expect(input).toHaveAccessibleDescription("ตามพาสปอร์ต");
    });

    it("When given an error, should replace the hint and mark the field invalid", () => {
      render(<Input label="ชื่อ" hint="ตามพาสปอร์ต" error="ใช้ตัวอักษร A–Z" />);
      const input = screen.getByLabelText("ชื่อ");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription("ใช้ตัวอักษร A–Z");
      expect(screen.queryByText("ตามพาสปอร์ต")).not.toBeInTheDocument();
    });

    it("When there is no label or help, should render only the field", () => {
      render(<Input placeholder="ตัวอย่าง" />);
      expect(screen.getByPlaceholderText("ตัวอย่าง")).toBeInTheDocument();
    });
  });

  describe("Select", () => {
    const items = [
      { value: "mr", label: "Mr" },
      { value: "ms", label: "Ms" },
    ];
    function renderSelect() {
      const onValueChange = vi.fn();
      render(
        <Select items={items} onValueChange={onValueChange}>
          <SelectTrigger aria-label="คำนำหน้า">
            <SelectValue placeholder="เลือก" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>,
      );
      return onValueChange;
    }

    it("When rendered, should be a 44px field-styled combobox trigger, not a native select", () => {
      renderSelect();
      const trigger = screen.getByRole("combobox", { name: "คำนำหน้า" });
      expect(trigger.tagName).not.toBe("SELECT");
      expect(trigger).toHaveClass("h-11", "rounded-sm", "bg-card");
    });

    it("When opened and an option is picked, should report its value and show its label", async () => {
      const onValueChange = renderSelect();
      const user = userEvent.setup();
      await user.click(screen.getByRole("combobox", { name: "คำนำหน้า" }));
      await user.click(await screen.findByRole("option", { name: "Ms" }));
      expect(onValueChange).toHaveBeenCalledWith("ms", expect.anything());
      expect(screen.getByRole("combobox")).toHaveTextContent("Ms");
    });
  });

  describe("Card", () => {
    it("When rendered, should be a rounded-md shadow-card surface", () => {
      render(<Card data-testid="card">x</Card>);
      expect(screen.getByTestId("card")).toHaveClass(
        "rounded-md",
        "shadow-card",
        "bg-card",
      );
    });

    it("When selected, should expose the selected state for the iris-mist style", () => {
      render(
        <Card data-testid="card" selected>
          x
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveAttribute(
        "data-selected",
        "true",
      );
      expect(screen.getByTestId("card").className).toContain(
        "data-selected:border-iris",
      );
    });
  });

  describe("Alert", () => {
    it.each([
      ["info", "bg-iris-mist"],
      ["warning", "bg-sunset-tint"],
      ["destructive", "text-destructive"],
      ["success", "text-success"],
    ] as const)(
      "When variant is %s, should apply its style with title and description",
      (variant, cls) => {
        render(
          <Alert
            variant={variant}
            title="หัวข้อ"
            icon={<svg data-testid="icon" />}
          >
            รายละเอียด
          </Alert>,
        );
        const alert = screen.getByRole("alert");
        expect(alert).toHaveClass(cls);
        expect(alert).toHaveTextContent("หัวข้อ");
        expect(alert).toHaveTextContent("รายละเอียด");
      },
    );

    it("When only a title is given, should render without a description", () => {
      render(<Alert title="หัวข้อ" />);
      expect(screen.getByRole("alert")).toHaveTextContent("หัวข้อ");
    });
  });

  describe("Checkbox", () => {
    it("When given label and description, should toggle from the label and describe itself", async () => {
      const onCheckedChange = vi.fn();
      render(
        <Checkbox
          label="ยอมรับนโยบาย"
          description="จำเป็น"
          onCheckedChange={onCheckedChange}
        />,
      );
      const box = screen.getByRole("checkbox", { name: "ยอมรับนโยบาย" });
      expect(box).toHaveAccessibleDescription("จำเป็น");
      expect(box).not.toBeChecked();
      await userEvent.click(screen.getByText("ยอมรับนโยบาย"));
      expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    });

    it("When there is no description, should render only the label", () => {
      render(<Checkbox label="การตลาด" />);
      expect(
        screen.getByRole("checkbox", { name: "การตลาด" }),
      ).not.toBeChecked();
    });
  });

  describe("Dialog", () => {
    it("When open, should show title, description and a Thai close button", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>ราคาเปลี่ยน</DialogTitle>
            <DialogDescription>ราคาใหม่</DialogDescription>
            <DialogFooter showCloseButton>
              <Button>ตกลง</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      expect(
        screen.getByRole("dialog", { name: "ราคาเปลี่ยน" }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: "ปิด" }).length,
      ).toBeGreaterThan(0);
    });
  });

  describe("Sheet", () => {
    it("When side is bottom, should be a rounded-t-lg sheet with a grip and a Thai close button", () => {
      render(
        <Sheet open>
          <SheetContent side="bottom">
            <SheetTitle>เลือกค่าโดยสาร</SheetTitle>
          </SheetContent>
        </Sheet>,
      );
      const sheet = screen.getByRole("dialog", { name: "เลือกค่าโดยสาร" });
      expect(sheet.className).toContain("data-[side=bottom]:rounded-t-lg");
      expect(
        sheet.querySelector('[data-slot="sheet-grip"]'),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "ปิด" })).toBeInTheDocument();
    });

    it("When side is right, should not render the grip", () => {
      render(
        <Sheet open>
          <SheetContent>
            <SheetTitle>เมนู</SheetTitle>
          </SheetContent>
        </Sheet>,
      );
      expect(
        document.querySelector('[data-slot="sheet-grip"]'),
      ).not.toBeInTheDocument();
    });
  });
});
