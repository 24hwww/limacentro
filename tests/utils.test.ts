import { describe, expect, it } from 'vitest';
import { safeHttpUrl, safeJsonLd, cn } from '@/lib/utils';

describe('safeHttpUrl', () => {
  it('devuelve null para valores vacíos', () => {
    expect(safeHttpUrl(null)).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
    expect(safeHttpUrl('')).toBeNull();
    expect(safeHttpUrl('   ')).toBeNull();
  });

  it('acepta URLs http/https', () => {
    expect(safeHttpUrl('https://ejemplo.pe')).toBe('https://ejemplo.pe/');
    expect(safeHttpUrl('http://ejemplo.pe/pagina')).toBe(
      'http://ejemplo.pe/pagina',
    );
  });

  it('añade https:// cuando falta el esquema', () => {
    expect(safeHttpUrl('www.negocio.pe')).toBe('https://www.negocio.pe/');
    expect(safeHttpUrl('negocio.pe/tienda')).toBe('https://negocio.pe/tienda');
  });

  it('rechaza esquemas peligrosos', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('data:text/html,<b>x</b>')).toBeNull();
    expect(safeHttpUrl('vbscript:msgbox(1)')).toBeNull();
    expect(safeHttpUrl('file:///etc/passwd')).toBeNull();
  });

  it('rechaza entradas que no son URL', () => {
    expect(safeHttpUrl('no es una url :::')).toBeNull();
  });
});

describe('safeJsonLd', () => {
  it('escapa "<" para evitar romper el tag script', () => {
    const malicious = { name: 'X</script><script>alert(1)</script>' };
    const out = safeJsonLd(malicious);
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c');
    expect(JSON.parse(out)).toEqual(malicious);
  });

  it('serializa JSON normal sin cambios semánticos', () => {
    const data = { name: 'Cevichería', rating: 4.5 };
    expect(JSON.parse(safeJsonLd(data))).toEqual(data);
  });
});

describe('cn', () => {
  it('combina clases y resuelve conflictos de tailwind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
});
