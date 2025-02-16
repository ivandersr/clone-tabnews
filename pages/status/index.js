import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    const updatedAt = new Date(data.updated_at);
    updatedAtText = updatedAt.toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText} </div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let databaseStatusContent = <p>Carregando...</p>;

  if (!isLoading && data) {
    databaseStatusContent = (
      <p>
        <strong>Versão do banco de dados:</strong> Postgres v
        {data.dependencies.database.version}
        <br />
        <strong>Máximo de conexões possíveis:</strong>{" "}
        {data.dependencies.database.max_connections}
        <br />
        <strong>Conexões ativas:</strong>{" "}
        {data.dependencies.database.active_connections}
      </p>
    );
  }

  return <>{databaseStatusContent}</>;
}
