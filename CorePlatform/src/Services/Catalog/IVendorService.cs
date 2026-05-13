using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IVendorService
{
    // SO24 // GET VENDORS
    Task<List<VendorDto>> GetVendors();
    // SO25 // GET VENDOR
    Task<VendorDto?> GetVendor(int id);
    
}