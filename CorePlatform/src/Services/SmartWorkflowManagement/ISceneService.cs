using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface ISceneService
{
    Task<List<SceneDto>> GetScenes();
    Task<List<SceneDto>> GetScenes(int itemId);
    Task<SceneDto?> GetScene(int id);
    Task<SceneDto> PostScene(SceneDto request);
    Task<bool> PutScene(SceneDto request);
    Task<bool> DeleteScene(int id);
}