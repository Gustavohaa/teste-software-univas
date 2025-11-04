import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Users from "../../src/components/Users";
import { api } from "../../src/services/api";

describe("Users - abrir formulário de criação", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it('mostra o formulário ao clicar em "Adicionar Usuário"', async () => {
    vi.spyOn(api, "get").mockResolvedValue({ data: { data: [] } } as any);
    render(<Users />);
    // espera o botão ficar disponível após o loading sumir
    const addButton = await screen.findByRole("button", {
      name: /Adicionar Usuário/i,
    });
    await userEvent.click(addButton);
    expect(screen.getByLabelText(/Nome:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
  });
});
