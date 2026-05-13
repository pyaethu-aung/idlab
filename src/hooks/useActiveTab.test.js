import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useActiveTab from "./useActiveTab";

describe("useActiveTab", () => {
  it("defaults to generator tab", () => {
    const { result } = renderHook(() => useActiveTab());
    expect(result.current.activeTab).toBe("generator");
  });

  it("switches to validator tab", () => {
    const { result } = renderHook(() => useActiveTab());
    act(() => result.current.setActiveTab("validator"));
    expect(result.current.activeTab).toBe("validator");
  });

  it("setting the current tab does not change state", () => {
    const { result } = renderHook(() => useActiveTab());
    const before = result.current.activeTab;
    act(() => result.current.setActiveTab("generator"));
    expect(result.current.activeTab).toBe(before);
  });
});
