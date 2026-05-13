using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface ISceneService
{
    // SO32 // GET SCENES
    Task<List<SceneDto>> GetScenes();
    // SO36 // GET SCENES FILTER
    Task<List<SceneDto>> GetScenes(int itemId);
    // SO37 // GET SCENE
    Task<SceneDto?> GetScene(int id);
    // SO35 // POST SCENE
    Task<SceneDto> PostScene(SceneDto request);
    // SO38 // PUT SCENE
    Task<bool> PutScene(SceneDto request);
    // SO39 // DELETE SCENE
    Task<bool> DeleteScene(int id);
}