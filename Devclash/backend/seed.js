import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import Company from "./src/models/company.model.js";
import Event from "./src/models/event.model.js";
import Job from "./src/models/job.model.js";
import fs from "fs";

dotenv.config();

const SEED_COUNT = 10;

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/devclash");
        console.log("Connected to MongoDB for Seeding...");

        // Wipe stale models correctly so unique CIN IDs do not clash!
        await Company.deleteMany({});
        await User.deleteMany({});
        await Event.deleteMany({});
        await Job.deleteMany({});

        // Generate Companies
        const companies = [];
        for (let i = 1; i <= SEED_COUNT; i++) {
            const c = await Company.create({
                name: `TechNova Corp ${i}`,
                domains: [`technova${i}.com`, `technova${i}.io`, `technova${i}.in`],
                cin: `U72900MH2023PTC${100000 + i}`,
                directors: [{ name: `Director ${i}`, email: `director${i}@technova${i}.com`, din: `0000100${i}` }],
                isVerified: true
            });
            companies.push(c);
        }
        console.log(`✅ Seeded ${SEED_COUNT} Companies`);

        // Generate Users
        const users = [];
        const plainPasswords = [];
        for (let i = 1; i <= SEED_COUNT; i++) {
            const u = await User.create({
                name: `Alice Engineer ${i}`,
                email: `alice${i}@technova${i}.com`,
                password: `password123`, // Will be hashed heavily by model
                role: i % 2 === 0 ? "OWNER" : "EMPLOYEE",
                companyId: companies[i - 1]._id,
                isFaceVerified: true
            });
            users.push(u);
            plainPasswords.push(`password123`);
        }
        console.log(`✅ Seeded ${SEED_COUNT} Users`);

        // Generate Events
        const events = [];
        for (let i = 1; i <= SEED_COUNT; i++) {
            const e = await Event.create({
                title: `Global DevClash Summit 202${i}`,
                description: `A highly anticipated networking event hosted by TechNova Corp ${i}. Join us to explore edge architecture!`,
                ticketPrice: i * 15,
                primaryHostId: companies[i - 1]._id,
                postedBy: users[i - 1]._id,
                eventStartDate: new Date(Date.now() + 86400000 * i),
                eventEndDate: new Date(Date.now() + 86400000 * i + 3600000),
                eventStatus: i % 3 === 0 ? "PENDING_COLLAB" : "LIVE",
                paymentStatus: "HELD_IN_ESCROW"
            });
            events.push(e);
        }
        console.log(`✅ Seeded ${SEED_COUNT} Events`);

        // Generate Jobs
        const jobs = [];
        for (let i = 1; i <= SEED_COUNT; i++) {
            const j = await Job.create({
                title: `Senior Full Stack Engineer v${i}`,
                companyId: companies[i - 1]._id,
                postedBy: users[i - 1]._id,
                status: i % 4 === 0 ? "PENDING" : "LIVE"
            });
            jobs.push(j);
        }
        console.log(`✅ Seeded ${SEED_COUNT} Jobs`);

        // Create Markdown Artifact summarizing the credentials
        const markdownLog = `# Devclash Seeded Test Data
Here is a comprehensive list of all the dummy data injected into your DB.
Use these to test logins! Password for all generated users is: \`password123\`

## 🏢 Companies
${companies.map(c => `- **${c.name}** (CIN: ${c.cin})`).join('\n')}

## 🧑‍💻 Users
${users.map(u => `- **${u.name}** (\`${u.email}\`) - Role: **${u.role}**`).join('\n')}

## 🎟️ Events
${events.map(e => `- **${e.title}** - Price: $${e.ticketPrice} - Status: ${e.eventStatus}`).join('\n')}

## 💼 Jobs
${jobs.map(j => `- **${j.title}** - Status: ${j.status}`).join('\n')}
`;

        fs.writeFileSync('./seeded_data.md', markdownLog);

        console.log("Seeding completely successful. Wrote log to seeded_data.md");
        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
}

seed();
