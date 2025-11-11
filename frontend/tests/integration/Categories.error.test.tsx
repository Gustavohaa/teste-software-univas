import { render, screen, waitFor } from "@testing-library/react";
import Categories from "../../src/components/Categories";
import { server, apiGet } from "../setup";
import { HttpResponse } from "msw";

describe("Categories integration - falhas da API", () => {
  it("mostra mensagem de erro quando a API falha", async () => {
    server.use(apiGet("/categories", () => HttpResponse.error()));

    render(<Categories />);

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao carregar categorias/i)
      ).toBeInTheDocument();
    });
  });

  it("mostra estado de carregamento antes de receber os dados", () => {
    render(<Categories />);

    expect(screen.getByText(/Carregando categorias/i)).toBeInTheDocument();
  });
});
