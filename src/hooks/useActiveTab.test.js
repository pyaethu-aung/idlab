import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import useActiveTab from "./useActiveTab";

beforeEach(() => {
  window.history.replaceState(null, "", "/generator");
});

describe("useActiveTab", () => {
  it("defaults to generator tab when path is /generator", () => {
    const { result } = renderHook(() => useActiveTab());
    expect(result.current.activeTab).toBe("generator");
  });

  it("redirects / to /generator and returns generator tab", () => {
    window.history.replaceState(null, "", "/");
    const { result } = renderHook(() => useActiveTab());
    expect(result.current.activeTab).toBe("generator");
    expect(window.location.pathname).toBe("/generator");
  });

  it("reads validator tab from /validator path", () => {
    window.history.replaceState(null, "", "/validator");
    const { result } = renderHook(() => useActiveTab());
    expect(result.current.activeTab).toBe("validator");
  });

  it("setActiveTab updates state and pushes to history", () => {
    const { result } = renderHook(() => useActiveTab());
    act(() => result.current.setActiveTab("validator"));
    expect(result.current.activeTab).toBe("validator");
    expect(window.location.pathname).toBe("/validator");
  });

  it("setActiveTab on current tab does not push a duplicate history entry", () => {
    const pushState = vi.spyOn(window.history, "pushState");
    const { result } = renderHook(() => useActiveTab());
    act(() => result.current.setActiveTab("generator"));
    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
  });
});
