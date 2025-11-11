import { render, screen, waitFor } from "@testing-library/react";
import Users from "../../src/components/Users";
import { server, apiGet } from "../setup";

describe("Users integrations - falhas da API", () => {
  it("mostra mensagem de erro quando a API falha", async () => {
    server.use(apiGet("/users", () => HttpResponse.error()));
    render(<Users />);
    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao carregar usuários/i)
      ).toBeInTheDocument();
    });
  });
});
