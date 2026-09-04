import { describe, expect, it } from "vitest";
import { isValidCep, isValidCpf, isValidPhone, maskCep, maskCpf, maskPhone } from "./br";

describe("isValidCpf", () => {
  it("accepts a check-digit-valid CPF, punctuated or not", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });

  it("rejects a wrong check digit", () => {
    expect(isValidCpf("529.982.247-26")).toBe(false);
  });

  it("rejects all-repeated digits, which pass the mod-11 arithmetic but are never real", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });

  it("rejects the wrong length", () => {
    expect(isValidCpf("123")).toBe(false);
  });
});

describe("maskCpf", () => {
  it("formats progressively as digits are typed", () => {
    expect(maskCpf("529")).toBe("529");
    expect(maskCpf("529982")).toBe("529.982");
    expect(maskCpf("529982247")).toBe("529.982.247");
    expect(maskCpf("52998224725")).toBe("529.982.247-25");
  });

  it("ignores non-digit characters and caps at 11 digits", () => {
    expect(maskCpf("529.982.247-25extra")).toBe("529.982.247-25");
  });
});

describe("isValidPhone", () => {
  it("accepts a valid 11-digit mobile number (9th digit 9)", () => {
    expect(isValidPhone("61991946758")).toBe(true);
  });

  it("accepts a valid 10-digit landline number", () => {
    expect(isValidPhone("6133654321")).toBe(true);
  });

  it("rejects an 11-digit number missing the mobile 9th digit", () => {
    expect(isValidPhone("61881946758")).toBe(false);
  });

  it("rejects a DDD outside the valid range", () => {
    expect(isValidPhone("00991946758")).toBe(false);
  });
});

describe("maskPhone", () => {
  it("formats a mobile number as (DD) DDDDD-DDDD", () => {
    expect(maskPhone("61991946758")).toBe("(61) 99194-6758");
  });
});

describe("isValidCep / maskCep", () => {
  it("requires exactly 8 digits", () => {
    expect(isValidCep("01310-200")).toBe(true);
    expect(isValidCep("0131020")).toBe(false);
  });

  it("formats as 00000-000", () => {
    expect(maskCep("01310200")).toBe("01310-200");
  });
});
