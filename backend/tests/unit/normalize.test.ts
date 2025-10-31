import { normalizeName } from "@/utils/normalize"
import { describe, it, expect } from "vitest"

describe('normalizeName', () => {
  it('remove espaços extras no início e fim', () => {
    expect(normalizeName('  task  ')).toBe('task')
  })

  it('converte tudo para minúsculas', () => {
    expect(normalizeName('Tarefa IMPORTANTE')).toBe('tarefa importante')
  })
})