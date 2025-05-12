
import { createClient } from '@supabase/supabase-js';  
import express from "express";

import axios from "axios";
import fs from "fs/promises";

const router = express.Router();
const SUPABASE_URL  = 'https://yaitdmtaaklatwgvnvku.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaXRkbXRhYWtsYXR3Z3Zudmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTg1ODQsImV4cCI6MjA0NDgzNDU4NH0.BARUcLalra3WJIqqiQ47pnOuXfutE6fp2FP7z9PXPTE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

router.get("/retrieve-fingerprint", async (req, res) => {

    try {
        
        const {data, error} = await supabase
            .from('senior_citizen_fingerprints')
            .select('senior_id, template_data');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({
                status: "error",
                message: "Error retrieving fingerprints from Supabase.",
            });
        }

        if (data.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No fingerprints found.",
            });
        }


        return res.json({
            status: "success",
            message: "Fingerprints retrieved successfully.",
            data: data,
        });

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: err instanceof Error ? err.message : "Unknown error",
        });
    }
});

export default router;