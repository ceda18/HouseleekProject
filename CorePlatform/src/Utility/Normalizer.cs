using System.Text;
using System.Text.Json;

namespace CorePlatform.src.Utility;

public class Normalizer
{
        // ─── JSON KEY NORMALIZATION ──────────────────────────────────────────────

    /// <summary>
    /// Walks the JSON tree and converts every snake_case key to camelCase.
    /// Values are left untouched. This makes the agent payload resilient to
    /// inconsistent casing from the LLM (e.g. "trigger_type" vs "triggerType").
    /// </summary>
    public static string NormalizeJsonKeysToCamelCase(string json)
    {
        using var doc = JsonDocument.Parse(json);
        using var ms  = new MemoryStream();
        using var writer = new Utf8JsonWriter(ms);
        NormalizeElement(doc.RootElement, writer);
        writer.Flush();
        return Encoding.UTF8.GetString(ms.ToArray());
    }

    private static void NormalizeElement(JsonElement el, Utf8JsonWriter w)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                w.WriteStartObject();
                foreach (var prop in el.EnumerateObject())
                {
                    w.WritePropertyName(SnakeToCamelCase(prop.Name));
                    NormalizeElement(prop.Value, w);
                }
                w.WriteEndObject();
                break;

            case JsonValueKind.Array:
                w.WriteStartArray();
                foreach (var item in el.EnumerateArray())
                    NormalizeElement(item, w);
                w.WriteEndArray();
                break;

            default:
                el.WriteTo(w);
                break;
        }
    }

    /// <summary>
    /// Converts snake_case → camelCase. Leaves already-camel or PascalCase strings untouched
    /// (no underscores means no transformation needed; PascalCase still deserializes because
    /// _proposalApplyOptions has PropertyNameCaseInsensitive = true).
    /// </summary>
    private static string SnakeToCamelCase(string name)
    {
        if (!name.Contains('_')) return name;
        var sb = new StringBuilder(name.Length);
        bool upper = false;
        foreach (var c in name)
        {
            if (c == '_') { upper = true; continue; }
            sb.Append(upper ? char.ToUpperInvariant(c) : c);
            upper = false;
        }
        return sb.ToString();
    }

        // ─── VALUE NORMALIZATION ─────────────────────────────────────────────────

    /// <summary>
    /// Maps friendly/legacy trigger type names to DB-enforced CHECK constraint values.
    /// Handles both manual UI submissions and AI-generated proposals.
    /// </summary>
    public static string NormalizeTriggerType(string? v) =>
        v?.ToLowerInvariant() switch
        {
            "state-driven" or "state" or "item-state" => "state-driven",
            "time-driven"  or "schedule" or "time" or "datetime" or "date" => "time-driven",
            _ => v ?? throw new ArgumentException($"triggerType is required but was null or empty.")
        };

    /// <summary>
    /// Maps legacy/alias value type names to DB-enforced CHECK constraint values.
    /// DB allows: 'string', 'int', 'double', 'bool', 'DateTime'.
    /// </summary>
    public static string NormalizeValueType(string? v) =>
        v?.ToLowerInvariant() switch
        {
            "int"      or "integer"  => "int",
            "double"   or "float"
                       or "decimal"  => "double",
            "bool"     or "boolean"  => "bool",
            "datetime" or "date"     => "DateTime",
            "string"                 => "string",
            _ => v ?? throw new ArgumentException($"valueType is required but was null or empty.")
        };


}