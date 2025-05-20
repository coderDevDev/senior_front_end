/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "@/shared/supabase";

// Interface for fingerprint template stored in database
export interface FingerprintTemplate {
  id: string;
  senior_id: string;
  template_data: string;
  finger_position: string;
  quality_score: number;
  is_active: boolean;
  created_at: string;
}

export interface SeniorInfo {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  healthStatus: string;
  address: string;
}

export class FingerprintService {
  private dpSdk: any | null;
  private readonly qualityThreshold: number = 40;
  private readonly matchThreshold: number = 0.85;
  private isInitializing: boolean = false;

  constructor(externalSdk?: any) {
    this.dpSdk = externalSdk || null;
    if (!externalSdk && !this.isInitializing) {
      this.isInitializing = true;
      this.initializeSdk().finally(() => {
        this.isInitializing = false;
      });
    }
  }

  // Initialize SDK with promise-based wait
  private async initializeSdk(): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn('FingerprintService: Window object not available (server-side?)');
      return;
    }

    if (!window.Fingerprint || !(window as any).Fingerprint.WebApi) {
      console.warn('FingerprintService: Fingerprint.WebApi not found');
      return;
    }

    try {
      // Create a new WebApi channel
      const channel = new (window as any).Fingerprint.WebApi();
      
      // Add a basic compareTemplates method if not exists
      if (!channel.compareTemplates) {
        channel.compareTemplates = async (template1: string, template2: string) => {
          // Basic comparison logic for fallback
          if (template1 === template2) return 1.0;
          
          // Calculate similarity based on template structure
          const similarity = this.calculateTemplateSimilarity(template1, template2);
          return similarity;
        };
      }

      this.dpSdk = channel;
      console.log('FingerprintService: SDK initialized successfully');
    } catch (error) {
      console.error('FingerprintService: Failed to initialize SDK:', error);
      this.dpSdk = null;
    }
  }

  // Set the SDK instance from external source
  setSdk(sdk: any): void {
    this.dpSdk = sdk;
    
    // Ensure SDK has compareTemplates method
    if (!this.dpSdk.compareTemplates) {
      this.dpSdk.compareTemplates = async (template1: string, template2: string) => {
        // Basic comparison logic for fallback
        if (template1 === template2) return 1.0;
        
        // Calculate similarity based on template structure
        const similarity = this.calculateTemplateSimilarity(template1, template2);
        return similarity;
      };
    }
    
    console.log('FingerprintService: SDK set externally');
  }

  // Basic template similarity calculation (fallback)
  private calculateTemplateSimilarity(template1: string, template2: string): number {
    try {
      // Decode base64 if needed
      const t1 = template1.includes('base64,') ? template1.split('base64,')[1] : template1;
      const t2 = template2.includes('base64,') ? template2.split('base64,')[1] : template2;

      // Simple length-based similarity (not accurate, just for fallback)
      const lengthSimilarity = Math.min(t1.length, t2.length) / Math.max(t1.length, t2.length);
      
      // Character-based similarity (not accurate, just for fallback)
      let matchingChars = 0;
      const minLength = Math.min(t1.length, t2.length);
      
      for (let i = 0; i < minLength; i++) {
        if (t1[i] === t2[i]) {
          matchingChars++;
        }
      }
      
      const charSimilarity = matchingChars / minLength;
      
      // Combined similarity score
      return (lengthSimilarity * 0.3 + charSimilarity * 0.7);
    } catch (error) {
      console.error('FingerprintService: Error calculating similarity:', error);
      return 0;
    }
  }

  // Wait for SDK to be available (used by external components)
  async waitForSdk(timeoutMs: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (this.isSdkAvailable()) {
        return true;
      }
      if (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        // Attempt to initialize again if not currently initializing
        await this.initializeSdk();
      }
    }
    console.warn('FingerprintService: SDK initialization timed out');
    return false;
  }

  // Check if SDK is available for comparison
  isSdkAvailable(): boolean {
    const isAvailable = !!this.dpSdk;
    if (!isAvailable) {
      console.warn('FingerprintService: SDK not available');
    }
    return isAvailable;
  }

  // Register a senior's fingerprint using FingerprintBridge data

  
  async registerFingerprint(
    
    seniorId: string,
    templateData: string,
    qualityScore: number,
    fingerPosition: string = 'right_thumb'
  ): Promise<boolean> {
    try {

      // Verify senior exists
      const { data: senior, error: seniorError } = await supabase
        .from('senior_citizens')
        .select('id')
        .eq('user_uid', seniorId)
        .single();

      if (seniorError || !senior) {
        console.error('FingerprintService: Senior not found:', seniorError?.message);
        return false;
      }

      // Deactivate existing templates
      await this.deactivateExistingTemplates(senior.id, fingerPosition);

      // Insert new template
      const { error: insertError } = await supabase
        .from('senior_citizen_fingerprints')
        .insert({
          senior_id: senior.id,
          template_data: templateData,
          finger_position: fingerPosition,
          quality_score: qualityScore,
          device_info: 'DigitalPersona 4500',
          is_active: true,
        });

      if (insertError) {
        console.error('FingerprintService: Error inserting template:', insertError.message);
        // Check if it's a JSON parsing error
        if (insertError.message.includes('JSON')) {
          console.error('FingerprintService: JSON Error - Template data might be malformed');
          console.error('Template data sample:', templateData.substring(0, 100));
        }
        return false;
      }

      console.log('FingerprintService: Fingerprint registered successfully');
      return true;
    } catch (error) {
      console.error('FingerprintService: Error registering fingerprint:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('FingerprintService: JSON Syntax Error', error);
      }
      return false;
    }
  }

  // Deactivate existing templates for a senior and finger position
  private async deactivateExistingTemplates(seniorId: string, fingerPosition: string): Promise<void> {
    try {
      const { data: existingTemplates, error: templateError } = await supabase
        .from('senior_citizen_fingerprints')
        .select('id')
        .eq('senior_id', seniorId)
        .eq('finger_position', fingerPosition)
        .eq('is_active', true);

      if (templateError) {
        throw new Error(`FingerprintService: Error checking existing templates: ${templateError.message}`);
      }

      if (existingTemplates?.length) {
        const { error: updateError } = await supabase
          .from('senior_citizen_fingerprints')
          .update({ is_active: false })
          .eq('id', existingTemplates[0].id);

        if (updateError) {
          throw new Error(`FingerprintService: Error deactivating template: ${updateError.message}`);
        }
        console.log('FingerprintService: Deactivated existing template:', existingTemplates[0].id);
      }
    } catch (error) {
      console.error('FingerprintService: Error in deactivateExistingTemplates:', error);
      throw error;
    }
  }

   // Identify senior by fingerprint using FingerprintBridge template
   // Identify senior by fingerprint using FingerprintBridge template

   async getSeniorById(seniorId: string): Promise<SeniorInfo | null> {
    try {
      const { data, error } = await supabase
        .from("senior_citizens")
        .select(
          `
          id,
          firstName,
          lastName,
          birthdate,
          healthStatus,
          address
        `
        )
        .eq("id", seniorId)
        .single();

      if (error) {
        console.error("FingerprintService: Supabase error", error.message);
        return null;
      }

      if (!data) {
        console.warn("FingerprintService: Senior not found:", seniorId);
        return null;
      }

      return data as SeniorInfo;
    } catch (err) {
      console.error("FingerprintService: Unexpected error", err);
      return null;
    }
  }

   async identifySeniorByFingerprint(
    scanTemplateData: string,
    scanQuality: number
  ): Promise<{
    matched: boolean;
    senior?: {
      id: string;
      firstName: string;
      lastName: string;
      birthdate: string;
      healthStatus: string;
      address: string;
    };
    score?: number;
    fingerId?: string;
    fingerPosition?: string;
  }> {
    try {
      console.log('FingerprintService: Identifying senior by fingerprint');

      // Validate input data
      if (!scanTemplateData || typeof scanTemplateData !== 'string') {
        console.error('FingerprintService: Invalid scan template data');
        return { matched: false };
      }

      // Validate quality score - lowered threshold
      if (scanQuality < 30) { // Much lower threshold for verification
        console.warn(`FingerprintService: Scan quality too low: ${scanQuality}`);
        return { matched: false };
      }

      // Strip data URL prefix if present
      let cleanScanData = scanTemplateData;
      if (scanTemplateData.includes('base64,')) {
        cleanScanData = scanTemplateData.split('base64,')[1];
      }

      // Fetch active templates
      const { data: templates, error: templatesError } = await supabase
        .from('senior_citizen_fingerprints')
        .select(`
          id,
          senior_id,
          template_data,
          finger_position,
          senior_citizens (
            id,
            firstName,
            lastName,
            birthdate,
            healthStatus,
            address
          )
        `)
        .eq('is_active', true);

      if (templatesError) {
        console.error('FingerprintService: Error fetching templates:', templatesError.message);
        if (templatesError.message.includes('JSON')) {
          console.error('FingerprintService: JSON Error in templates query');
        }
        return { matched: false };
      }

      if (!templates?.length) {
        console.log('FingerprintService: No active templates found');
        return { matched: false };
      }

      let bestMatch: {
        matched: boolean;
        score: number;
        senior: any;
        fingerId: string;
        fingerPosition: string;
      } = {
        matched: false,
        score: 0,
        senior: null,
        fingerId: '',
        fingerPosition: '',
      };

      for (const template of templates) {
        let score = 0;
        
        // Use SDK comparison if available
        if (this.dpSdk && typeof this.dpSdk.compareTemplates === 'function') {
          try {
            // The compareTemplates method might return either a number or a Promise
            const result = await this.dpSdk.compareTemplates(cleanScanData, template.template_data);
            
            // Handle if the result is a wrapped object
            if (typeof result === 'object' && result !== null && 'score' in result) {
              score = result.score;
            } else if (typeof result === 'number') {
              score = result;
            } else {
              console.warn('FingerprintService: Unexpected comparison result format:', result);
              score = 0;
            }
            
            console.log(`FingerprintService: Match score for senior ${template.senior_id}: ${score}`);
          } catch (error) {
            console.error('FingerprintService: Error comparing templates:', error);
            // Fall back to simple comparison
            score = this.calculateTemplateSimilarity(cleanScanData, template.template_data);
          }
        } else {
          // Fallback to basic comparison
          console.warn('FingerprintService: Using fallback comparison');
          score = this.calculateTemplateSimilarity(cleanScanData, template.template_data);
        }

        if (score > bestMatch.score) {
          bestMatch = {
            matched: score >= this.matchThreshold,
            score,
            senior: template.senior_citizens,
            fingerId: template.id,
            fingerPosition: template.finger_position,
          };
        }
      }

      // If we have any reasonable match, consider it successful
      if (bestMatch.score > 0.3) { // Very low threshold for accepting a match
        bestMatch.matched = true;
      }

      if (bestMatch.matched) {
        console.log(
          `FingerprintService: Found match: ${bestMatch.senior?.firstName} ${bestMatch.senior?.lastName} (Score: ${bestMatch.score})`
        );
      } else {
        console.log('FingerprintService: No matching fingerprint found. Best score:', bestMatch.score);
      }

      return bestMatch;
    } catch (error) {
      console.error('FingerprintService: Error identifying senior:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('FingerprintService: JSON Syntax Error', error);
      }
      return { matched: false };
    }
  }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

  // Get active templates for a senior
  async getActiveTemplates(seniorId: string): Promise<FingerprintTemplate[]> {
    try {
      const { data: senior, error: seniorError } = await supabase
        .from('senior_citizens')
        .select('id')
        .eq('user_uid', seniorId)
        .single();

      if (seniorError) {
        console.error('FingerprintService: Error fetching senior:', seniorError);
        if (seniorError.message.includes('JSON')) {
          console.error('FingerprintService: JSON Error in senior query');
        }
        return [];
      }

      if (!senior) {
        console.error('FingerprintService: Senior not found');
        return [];
      }

      const { data: templates, error: templateError } = await supabase
        .from('senior_citizen_fingerprints')
        .select('*')
        .eq('senior_id', senior.id)
        .eq('is_active', true);

      if (templateError) {
        console.error('FingerprintService: Error fetching templates:', templateError.message);
        if (templateError.message.includes('JSON')) {
          console.error('FingerprintService: JSON Error in templates query');
        }
        return [];
      }

      console.log('FingerprintService: Fetched active templates:', templates?.length || 0);
      return (templates || []) as FingerprintTemplate[];
    } catch (error) {
      console.error('FingerprintService: Error getting active templates:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('FingerprintService: JSON Syntax Error', error);
      }
      return [];
    }
  }
}
