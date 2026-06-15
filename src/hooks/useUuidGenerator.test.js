import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const DNS_NS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const URL_NS = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";

const { buildBatchMock, formatUuidMock, uuidGeneratorsMock, uuidNameBasedMock, makeNameBasedGeneratorMock } = vi.hoisted(
  () => {
    const uuidNameBasedMock = { v3: vi.fn(() => "uuid-v3"), v5: vi.fn(() => "uuid-v5") };
    const makeNameBasedGeneratorMock = vi.fn((vFn, ns, n) => () => vFn(n, ns));
    return {
      buildBatchMock: vi.fn(),
      formatUuidMock: vi.fn(),
      uuidGeneratorsMock: {
        v1: vi.fn(() => "uuid-v1"),
        v4: vi.fn(() => "uuid-v4"),
        v7: vi.fn(() => "uuid-v7"),
      },
      uuidNameBasedMock,
      makeNameBasedGeneratorMock,
    };
  }
);

vi.mock("../utils/uuid", () => ({
  defaultOptions: {
    uppercase: false,
    trimHyphens: false,
    wrapBraces: false,
  },
  defaultNamespace: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  buildBatch: buildBatchMock,
  formatUuid: formatUuidMock,
  uuidGenerators: uuidGeneratorsMock,
  uuidNameBased: uuidNameBasedMock,
  makeNameBasedGenerator: makeNameBasedGeneratorMock,
}));

import useUuidGenerator from "./useUuidGenerator";

const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard"
);

const assignClipboard = (implementation) => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: implementation,
  });
};

describe("useUuidGenerator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    let nextId = 0;
    Object.values(uuidGeneratorsMock).forEach((fn) =>
      fn.mockImplementation(() => `uuid-${nextId++}`)
    );
    Object.values(uuidNameBasedMock).forEach((fn) =>
      fn.mockImplementation((n, ns) => `named-${n}-${ns}-${nextId++}`)
    );
    buildBatchMock.mockImplementation(
      (count, generator = uuidGeneratorsMock.v4) =>
        Array.from({ length: count }, () => generator())
    );
    formatUuidMock.mockImplementation((value) => `formatted-${value}`);
    assignClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
  });

  afterEach(() => {
    vi.clearAllMocks();
    makeNameBasedGeneratorMock.mockImplementation((vFn, ns, n) => () => vFn(n, ns));
    vi.restoreAllMocks();
    vi.useRealTimers();
    if (originalClipboardDescriptor) {
      Object.defineProperty(
        navigator,
        "clipboard",
        originalClipboardDescriptor
      );
    } else {
      delete navigator.clipboard;
    }
  });

  it("bootstraps a formatted batch and exposes helpers", () => {
    const { result } = renderHook(() => useUuidGenerator());

    expect(buildBatchMock).toHaveBeenCalledWith(8);
    expect(result.current.formattedUuids).toEqual(
      Array(8).fill(expect.stringContaining("formatted-"))
    );
    expect(result.current.visibleBatchSize).toBe(8);
    expect(result.current.clipboardSupported).toBe(true);
  });

  it("handles regeneration and version changes", () => {
    const { result } = renderHook(() => useUuidGenerator());

    act(() => {
      result.current.regenerate();
    });
    expect(result.current.isRefreshing).toBe(true);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.isRefreshing).toBe(false);

    act(() => {
      result.current.handleVersionChange("v1");
    });
    expect(result.current.selectedVersion).toBe("v1");
    expect(result.current.feedback).toMatch(/Switched to UUID V1/i);
  });

  it("toggles formatting options and commits slider changes", () => {
    const { result } = renderHook(() => useUuidGenerator());

    act(() => {
      result.current.setBatchSize(42);
      result.current.toggleOption("uppercase");
    });

    expect(result.current.options.uppercase).toBe(true);
    expect(result.current.batchSize).toBe(42);

    act(() => {
      result.current.commitBatchSize();
    });
    expect(buildBatchMock).toHaveBeenLastCalledWith(
      expect.any(Number),
      expect.any(Function)
    );
  });

  it("copies UUIDs when the Clipboard API is present", async () => {
    const clipboardSpy = vi.spyOn(navigator.clipboard, "writeText");
    const { result } = renderHook(() => useUuidGenerator());
    const value = result.current.formattedUuids[0];

    await act(async () => {
      await result.current.handleCopy(value);
    });

    expect(clipboardSpy).toHaveBeenCalledWith(value);
    expect(result.current.copiedUuid).toBe(value);
    expect(result.current.feedback).toBe("Copied to clipboard");
  });

  it("switches to v3 and exposes isNameBased", () => {
    const { result } = renderHook(() => useUuidGenerator());

    act(() => {
      result.current.handleVersionChange("v3");
    });

    expect(result.current.selectedVersion).toBe("v3");
    expect(result.current.isNameBased).toBe(true);
    expect(makeNameBasedGeneratorMock).toHaveBeenCalledWith(
      uuidNameBasedMock.v3,
      DNS_NS,
      ""
    );
  });

  it("switches to v5 and uses makeNameBasedGenerator", () => {
    const { result } = renderHook(() => useUuidGenerator());

    act(() => {
      result.current.handleVersionChange("v5");
    });

    expect(result.current.selectedVersion).toBe("v5");
    expect(result.current.isNameBased).toBe(true);
    expect(makeNameBasedGeneratorMock).toHaveBeenCalledWith(
      uuidNameBasedMock.v5,
      DNS_NS,
      ""
    );
  });

  it("handleNamespaceChange updates namespace and calls makeNameBasedGenerator", () => {
    const { result } = renderHook(() => useUuidGenerator());

    act(() => {
      result.current.handleVersionChange("v5");
    });
    makeNameBasedGeneratorMock.mockClear();

    act(() => {
      result.current.handleNamespaceChange(URL_NS);
    });

    expect(result.current.namespace).toBe(URL_NS);
    expect(makeNameBasedGeneratorMock).toHaveBeenCalledWith(
      uuidNameBasedMock.v5,
      URL_NS,
      ""
    );
  });

  it("handleNameChange updates name and calls makeNameBasedGenerator", () => {
    const { result } = renderHook(() => useUuidGenerator());

    act(() => {
      result.current.handleVersionChange("v3");
    });
    makeNameBasedGeneratorMock.mockClear();

    act(() => {
      result.current.handleNameChange("example.com");
    });

    expect(result.current.name).toBe("example.com");
    expect(makeNameBasedGeneratorMock).toHaveBeenCalledWith(
      uuidNameBasedMock.v3,
      DNS_NS,
      "example.com"
    );
  });

  it("isNameBased is false for v1, v4, v7", () => {
    const { result } = renderHook(() => useUuidGenerator());

    expect(result.current.isNameBased).toBe(false);

    act(() => { result.current.handleVersionChange("v1"); });
    expect(result.current.isNameBased).toBe(false);

    act(() => { result.current.handleVersionChange("v7"); });
    expect(result.current.isNameBased).toBe(false);
  });

  it("downloads batches and resets busy state", async () => {
    if (!URL.createObjectURL) {
      URL.createObjectURL = () => "";
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = () => {};
    }
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:uuid");
    const revokeSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const { result } = renderHook(() => useUuidGenerator());

    await act(async () => {
      await result.current.downloadList();
    });

    expect(result.current.isDownloading).toBe(true);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.isDownloading).toBe(false);
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });
});
