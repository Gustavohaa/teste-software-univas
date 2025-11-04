import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Users from "../../src/components/Users";
import { api } from "../../src/services/api";

describe("Users (falha de carregamento)", () => {
  it("exibe mensagem de erro quando a API falha", async () => {
    vi.spyOn(api, "get").mockRejectedValue(new Error("Network error"));
    render(<Users />);
    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao carregar usuários/i)
      ).toBeInTheDocument();
    });
  });
});
