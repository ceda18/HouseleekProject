// Utility/ValueTypeValidator.cs
using CorePlatform.src.Models;

namespace CorePlatform.src.Utility;

public static class ValueTypeValidator
{
    public static (bool isValid, string? error) Validate(object value, ActionDefinition actionDefinition)
    {
        var valueType = actionDefinition.ValueType;
        var controllable = actionDefinition.Controllable;
        var minValue = actionDefinition.MinValue;
        var maxValue = actionDefinition.MaxValue;

        if (!controllable)
            return (false, "This action is a sensor and cannot be controlled.");

        object parsed;
        try
        {
            parsed = ValueTypeParser.TryParseValue(value.ToString()!, valueType);
        }
        catch (ArgumentException ex)
        {
            return (false, ex.Message);
        }

        if (parsed is int intVal)
        {
            if (minValue.HasValue && intVal < minValue) return (false, $"Value {intVal} is below minimum {minValue}.");
            if (maxValue.HasValue && intVal > maxValue) return (false, $"Value {intVal} exceeds maximum {maxValue}.");
        }
        else if (parsed is double doubleVal)
        {
            if (minValue.HasValue && doubleVal < minValue) return (false, $"Value {doubleVal} is below minimum {minValue}.");
            if (maxValue.HasValue && doubleVal > maxValue) return (false, $"Value {doubleVal} exceeds maximum {maxValue}.");
        }

        return (true, null);
    }
}