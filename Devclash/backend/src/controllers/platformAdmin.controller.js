import Company from "../models/company.model.js";
import CompanyMember from "../models/companyMember.model.js";
import User from "../models/user.model.js";

// Endpoint: POST /api/internal/companies
// Usage: Devclash staff manually onboard a corporate entity
export const onboardCompany = async (req, res) => {
  try {
    const { name, domain, cin, directors } = req.body;
    
    // Check if exists
    const existing = await Company.findOne({ cin });
    if (existing) {
      return res.status(400).json({ error: "Company with this CIN is already onboarded." });
    }

    const company = await Company.create({
      name,
      domain: domain.toLowerCase(),
      cin,
      directors: directors || [],
      isVerified: true
    });

    res.status(201).json({ message: "Company explicitly trusted and onboarded.", company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoint: POST /api/internal/companies/:companyId/owners
// Usage: Devclash staff manually link a trusted pre-verified User to a Company
export const verifyCompanyOwner = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { email } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found in internal ledger." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User account does not exist. They must register an identity first." });
    }

    const mapping = await CompanyMember.create({
      userId: user._id,
      companyId: company._id,
      role: "owner",
      status: "active",
      is_verified_owner: true
    });

    res.status(200).json({ message: "Ownership explicitly verified and bridged by staff.", mapping });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
