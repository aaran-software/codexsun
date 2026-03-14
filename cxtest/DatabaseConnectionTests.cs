using Npgsql;

namespace cxtest;

public sealed class DatabaseConnectionTests
{
    private const string DefaultConnectionString =
        "Host=localhost;Port=7025;Database=codexsun;Username=cxadmin;Password=DbPass1@@";

    [Fact]
    public async Task Connects_to_postgresql_and_executes_select_1()
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__codexsun")
            ?? DefaultConnectionString;

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand("SELECT 1", connection);
        var result = await command.ExecuteScalarAsync();

        Assert.Equal(1, result);
    }
}
