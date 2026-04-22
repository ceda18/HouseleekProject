using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IVendorService
{
    Task<List<VendorDto>> GetVendors();
    Task<VendorDto?> GetVendor(int id);
    
}