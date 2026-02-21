import { Router } from "express";
import zod from "zod";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches";
import { db } from "../db/db";
import { matches } from "../db/schema";
import { getMatchStatus } from "../utils/match-status";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

matchRouter.get("/"  , async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if(!parsed.success){
        return res.status(400).json({ error: parsed.error.message });
    }
    const  limit = Math.min(parsed.data.limit ?? 50, 100);

    try{
        const results = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit);
        res.json({results});
    }catch(err){
        console.error("Error fetching matches:", err);
        res.status(500).json({ error: "Internal server error" });
    }

});


matchRouter.post("/" , async (req, res)=>{
    const parsed = createMatchSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
    }
    try{
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(parsed.data.startTime),
            endTime: new Date(parsed.data.endTime),
            homeScore: parsed.data.homeScore ?? 0,
            awayScore: parsed.data.awayScore ?? 0,
            status: getMatchStatus(parsed.data.startTime, parsed.data.endTime) || 'scheduled',
        }).returning();
        res.status(201).json(event);
    }catch(err){
        console.error("Error creating match:", err);
        res.status(500).json({ error: "Internal server error" });
    }

})