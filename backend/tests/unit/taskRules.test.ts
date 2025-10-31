import { canTransition } from '@/utils/taskRules'
import { describe, it, expect } from 'vitest'

describe('canTransition', () => {
  it('não permite transição a partir de COMPLETED ou CANCELLED', () => {
    expect(canTransition('COMPLETED', 'PENDING')).toBe(false)
    expect(canTransition('CANCELLED', 'PENDING')).toBe(false)
  })

  it('permite transição a partir de PENDING para IN_PROGRESS', () => {
    expect(canTransition('PENDING', 'IN_PROGRESS')).toBe(true)
  })

  it('permite transição a partir de IN_PROGRESS para COMPLETED ou CANCELLED', () => {
    expect(canTransition('IN_PROGRESS', 'COMPLETED')).toBe(true)
    expect(canTransition('IN_PROGRESS', 'CANCELLED')).toBe(true)
  })

  it('não permite outras transições a partir de PENDING', () => {
    expect(canTransition('PENDING', 'COMPLETED')).toBe(false)
    expect(canTransition('PENDING', 'CANCELLED')).toBe(false)
  })

  it('não permite transições inválidas de IN_PROGRESS', () => {
    expect(canTransition('IN_PROGRESS', 'PENDING')).toBe(false)
  })
  
})
