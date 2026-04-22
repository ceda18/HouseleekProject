using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class VendorService : IVendorService
{
    private readonly AppDbContext _db;

    public VendorService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<VendorDto>> GetVendors()
    {
        var vendors = await _db.Vendors.ToListAsync();
        return vendors.Select(v => MapResponse(v)).ToList();
    }

    public async Task<VendorDto?> GetVendor(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        return vendor == null ? null : MapResponse(vendor);
    }

    ////////////////////////////
    // MAPPING METHODS
    ///////////////////////////

    private VendorDto MapResponse(Vendor vendor)
    {
        return new VendorDto
        {
            UserId = vendor.UserId,
            Name = vendor.Name,
            Pseudonym = vendor.Pseudonym
        };
    }

}