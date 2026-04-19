namespace CorePlatform.src.Utility;
public class ValueTypeParser
{
    public static object ParseValue(string value, string valueType)
    {
        switch (valueType.ToLowerInvariant())
        {
            case "string":
                return value;
            case "int":
            case "integer":
                return (object)int.Parse(value);
            case "double":
            case "float":
            case "decimal":
                return (object)double.Parse(value);
            case "bool":
            case "boolean":
                return (object)bool.Parse(value);
            case "datetime":
            case "date":
                return (object)DateTime.Parse(value);
            default:
                break;
        }

        throw new ArgumentException($"Unsupported value type: {valueType}");

        // return valueType.ToLower() switch
        // {
        //     "int" => int.Parse(value),
        //     "double" => double.Parse(value),
        //     "bool" => bool.Parse(value),
        //     "datetime" => DateTime.Parse(value),
        //     "string" => value,
        //     _ => throw new ArgumentException($"Unsupported value type: {valueType}")
        // };
    }
}