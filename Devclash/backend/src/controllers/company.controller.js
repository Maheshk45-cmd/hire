import Company from "../models/company.model.js";
import CompanyMember from "../models/companyMember.model.js";
import AdminNomination from "../models/adminNomination.model.js";
import AdminRequest from "../models/adminRequest.model.js";
import User from "../models/user.model.js";

// Strict Admin Application Endpoint (Replaces the old claimOwner / mock minting)
export const applyCompanyAdmin = async (req, res) => {
  try {
    const { name, email, password, cin } = req.body;

    // STEP 1 & 2: Search company strictly
    const company = await Company.findOne({ cin });

    if (!company) {
      return res.status(403).json({ 
        error: "This company is not onboarded / verified in our system yet. Company admin access cannot be requested." 
      });
    }

    // STEP 3: Check verified owners
    const verifiedOwners = await CompanyMember.find({
      companyId: company._id,
      is_verified_owner: true
    }).populate('userId');

    if (verifiedOwners.length === 0) {
      return res.status(403).json({ 
        error: "No verified ownership records available for this company. Contact support." 
      });
    }

    // STEP 4: Check existing admin
    const existingAdmins = await CompanyMember.find({
      companyId: company._id,
      role: { $in: ["admin", "owner"] },
      status: "active"
    });

    if (existingAdmins.length > 0) {
      // EXISTING ADMIN FLOW - Require a nomination
      const nomination = await AdminNomination.findOne({
        companyId: company._id,
        nomineeEmail: email.toLowerCase(),
        status: "pending"
      });

      if (!nomination) {
        return res.status(403).json({ 
          error: "You lack a valid nomination from the existing administrators." 
        });
      }
    }

    // Pass: Create/find the user so we can tie their ID to the Admin Request
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password, role: "USER" });
    }

    // NO EXISTING ADMIN OR NOMINATION PASSED -> Create Voting Request
    const adminRequest = await AdminRequest.create({
      userId: user._id,
      companyId: company._id,
      status: "pending",
      votes: []
    });

    return res.status(200).json({ 
      message: "Application accepted. Voting request dispatched to directors.",
      requestId: adminRequest._id,
      userId: user._id
    });

  } catch (error) {
    console.error("[Company Admin Apply Error]", error);
    res.status(500).json({ error: error.message });
  }
};

// ... other existing legacy employee routes ...
export const joinEmployee = async (req, res) => {
  try {
    const { googleEmail } = req.body;
    
    if (!googleEmail || !googleEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid Google Email" });
    }

    const hostedDomain = googleEmail.split("@")[1];
    const company = await Company.findOne({ domain: hostedDomain.toLowerCase() });
    
    if (!company) {
      return res.status(404).json({ error: "No registered company matches this domain." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: "EMPLOYEE", companyId: company._id },
      { new: true }
    );

    res.status(200).json({ message: "Joined company successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Mock MCA Database
const mockMcaDatabase = [
  { name: "Acme Corp", cin: "L12345MH2023PTC123456", status: "Active" },
  { name: "TechNova Solutions", cin: "U72900KA2021PTC098765", status: "Active" },
  { name: "Devclash Network", cin: "L99999DL2024PTC111111", status: "Active" },
];

export const searchMcaDatabase = async (req, res) => {
  try {
    const { query } = req.query; // this can be name or cin
    if (!query) return res.status(400).json({ error: "Query parameter is required" });

    const lowerQuery = query.toLowerCase();
    
    // 1. Check Hardcoded Mock Database
    let mcaCompany = mockMcaDatabase.find(
      c => c.name.toLowerCase().includes(lowerQuery) || c.cin.toLowerCase().includes(lowerQuery)
    );

    // 2. Fallback to querying dynamic seeded Database dynamically directly matching MCA mock behavior
    let internalCompany = null;
    if (!mcaCompany) {
      internalCompany = await Company.findOne({
        $or: [
          { cin: new RegExp(query, 'i') },
          { name: new RegExp(query, 'i') }
        ]
      });

      if (internalCompany) {
        mcaCompany = { 
          name: internalCompany.name, 
          cin: internalCompany.cin, 
          status: "Active" 
        };
      }
    }

    if (!mcaCompany) {
      return res.status(404).json({ error: "No matching company found in MCA database or our Records." });
    }

    // Now check if it exists in our internal DB to see if it has an admin
    if (!internalCompany) {
       internalCompany = await Company.findOne({ cin: mcaCompany.cin });
    }
    let hasAdmin = false;
    
    if (internalCompany) {
       const existingAdmins = await CompanyMember.find({
          companyId: internalCompany._id,
          role: { $in: ["admin", "owner"] },
          status: "active"
       });
       if (existingAdmins.length > 0) hasAdmin = true;
    }

    res.status(200).json({
      name: mcaCompany.name,
      cin: mcaCompany.cin,
      mcaStatus: mcaCompany.status,
      hasAdmin,
      isRegisteredInternally: !!internalCompany
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
