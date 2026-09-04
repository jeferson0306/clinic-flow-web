import { describe, expect, it } from "vitest";
import { formatCEP, formatCNPJ, formatCPF, formatCurrency, formatPhone, slugify, truncate } from "./utils";

describe("formatCurrency", () => {
  // Intl's pt-BR currency format joins "R$" to the amount with U+00A0
  // (non-breaking space), not a regular space — invisible in a diff, so
  // comparisons here strip whitespace rather than embedding the literal.
  const normalize = (s: string) => s.replace(/\s/g, " ");

  it("formats cents-derived reais as BRL", () => {
    expect(normalize(formatCurrency(150))).toBe("R$ 150,00");
    expect(normalize(formatCurrency(1999.9))).toBe("R$ 1.999,90");
  });
});

describe("formatCPF / formatCNPJ / formatPhone / formatCEP", () => {
  it("punctuates a bare CPF", () => {
    expect(formatCPF("52998224725")).toBe("529.982.247-25");
  });

  it("punctuates a bare CNPJ", () => {
    expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("formats an 11-digit mobile and a 10-digit landline differently", () => {
    expect(formatPhone("61991946758")).toBe("(61) 99194-6758");
    expect(formatPhone("6133654321")).toBe("(61) 3365-4321");
  });

  it("punctuates a bare CEP", () => {
    expect(formatCEP("01310200")).toBe("01310-200");
  });
});

describe("slugify", () => {
  it("lowercases, strips accents and collapses separators", () => {
    expect(slugify("Consulta Cardiológica")).toBe("consulta-cardiologica");
  });
});

describe("truncate", () => {
  it("leaves short text untouched", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and appends an ellipsis when text exceeds max", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
  });
});
