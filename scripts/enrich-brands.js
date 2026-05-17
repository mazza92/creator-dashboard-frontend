const axios = require('axios');
const { fetchAllBrands, updateBrandDescription } = require('./data-quality-review');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.newcollab.co';

/**
 * Brand enrichment data
 * Format: { slug: { description: "...", notes: "..." } }
 * 
 * Descriptions should be:
 * - 150-200 characters
 * - Include brand origin/identity
 * - Include category/specialty
 * - Include signature products or technology
 * - Include key differentiators (vegan, cruelty-free, price point, etc.)
 */

const BRAND_ENRICHMENTS = {
  // Beauty brands (continuing from Batch 1)
  // Already completed: ColourPop, Bondi Sands, The Ordinary, Sand & Sky, Tower 28, Glow Recipe, Summer Fridays, Frank Body, K18, Solawave
  
  // Remaining Beauty brands
  'anastasia-beverly-hills': {
    description: 'Luxury beauty brand founded by Anastasia Soare, specializing in eyebrow products and professional makeup. Known for Brow Wiz, Dipbrow Pomade, and Modern Renaissance palette. Cruelty-free, professional-grade formulas.',
    notes: 'Founded 1997, eyebrow specialist, professional makeup'
  },
  'revolution-beauty': {
    description: 'UK-based affordable beauty brand offering makeup, skincare, and haircare. Known for IRL Filter Foundation, Relove Conceal & Define, and collaborations. Cruelty-free, vegan options, under $15.',
    notes: 'UK brand, affordable, cruelty-free, wide range'
  },
  'function-of-beauty': {
    description: 'Customizable hair care brand offering personalized shampoo, conditioner, and treatments based on hair quiz. Made-to-order formulas targeting specific hair concerns. Vegan, cruelty-free, customizable.',
    notes: 'Customizable, personalized, made-to-order, vegan'
  },
  'drunk-elephant': {
    description: 'Clean skincare brand focused on biocompatible ingredients and pH-balanced formulas. Known for C-Firma Vitamin C serum, Protini Polypeptide cream, and "suspicious 6" free philosophy. No essential oils, no fragrance.',
    notes: 'Clean beauty, biocompatible, pH-balanced, no fragrance'
  },
  'glossier': {
    description: 'Minimalist beauty brand known for "skin first, makeup second" philosophy. Signature products include Boy Brow, Cloud Paint blush, and Milky Jelly Cleanser. Natural finish, easy application, millennial-focused.',
    notes: 'Minimalist, skin-first, natural finish, millennial brand'
  },
  'fenty-beauty': {
    description: 'Inclusive beauty brand by Rihanna offering 50+ foundation shades and diverse makeup range. Known for Pro Filt\'r Foundation, Gloss Bomb, and Killawatt highlighters. Cruelty-free, wide shade range.',
    notes: 'Rihanna brand, inclusive shades, diverse range, cruelty-free'
  },
  'rare-beauty': {
    description: 'Beauty brand by Selena Gomez focused on mental health awareness and self-acceptance. Known for Soft Pinch Liquid Blush, Liquid Touch Foundation, and Positive Light Liquid Luminizer. 1% to Rare Impact Fund.',
    notes: 'Selena Gomez, mental health focus, liquid formulas, philanthropy'
  },
  'rare-beauty-by-selena-gomez': {
    description: 'Beauty brand by Selena Gomez focused on mental health awareness and self-acceptance. Known for Soft Pinch Liquid Blush, Liquid Touch Foundation, and Positive Light Liquid Luminizer. 1% to Rare Impact Fund.',
    notes: 'Selena Gomez, mental health focus, liquid formulas, philanthropy'
  },
  'tula-skincare': {
    description: 'Probiotic-powered skincare brand offering effective, gentle products for all skin types. Known for cult-favorite cleansers, serums, and moisturizers featuring superfoods and probiotics. Clean, effective, probiotic-focused.',
    notes: 'Probiotic skincare, superfoods, clean, effective'
  },
  'youth-to-the-people': {
    description: 'Clean skincare brand offering superfood-powered, vegan formulas. Known for Superfood Cleanser, Adaptogen Deep Moisture Cream, and Yerba Mate Resurfacing Energy Facial. Clean, vegan, superfood ingredients.',
    notes: 'Clean, vegan, superfood ingredients, effective'
  },
  'amika': {
    description: 'Hair care brand offering professional-quality products for all hair types. Known for The Kure Repair line, Perk Up Dry Shampoo, and Soulfood Nourishing Mask. Professional quality, inclusive, effective formulas.',
    notes: 'Hair care, professional quality, inclusive, effective'
  },
  'fenty-beauty-by-rihanna': {
    description: 'Inclusive beauty brand by Rihanna offering 50+ foundation shades and diverse makeup range. Known for Pro Filt\'r Foundation, Gloss Bomb, and Killawatt highlighters. Cruelty-free, wide shade range, inclusive.',
    notes: 'Rihanna brand, inclusive shades, diverse range, cruelty-free'
  },
  'mecca': {
    description: 'Australian beauty retailer and brand offering curated selection of luxury and cult beauty products. Known for Mecca Cosmetica line, exclusive brand partnerships, and beauty services. Australian, curated, luxury.',
    notes: 'Australian retailer, curated, luxury, exclusive brands'
  },
  'nuface': {
    description: 'At-home microcurrent device brand offering professional-grade facial toning tools. Known for NuFACE Trinity, Mini, and FIX devices for lifting and contouring. Professional-grade, at-home devices, microcurrent technology.',
    notes: 'Microcurrent devices, at-home, professional-grade, facial toning'
  },
  'bys-cosmetics': {
    description: 'Australian affordable makeup brand offering quality cosmetics at accessible prices. Known for eyeshadow palettes, lip products, and complexion products. Australian, affordable, quality, accessible.',
    notes: 'Australian, affordable, quality, accessible'
  },
  'morphe': {
    description: 'Professional makeup brand offering affordable eyeshadow palettes, brushes, and cosmetics. Known for 35-pan palettes, Jaclyn Hill collaborations, and influencer partnerships. Cruelty-free, professional quality, accessible pricing.',
    notes: 'Affordable, professional, influencer collaborations, large palettes'
  },
  'tarte-cosmetics': {
    description: 'Natural beauty brand combining high-performance naturals with proven ingredients. Known for Shape Tape Concealer, Amazonian Clay foundation, and vegan formulas. Cruelty-free, eco-conscious packaging.',
    notes: 'Natural ingredients, high-performance, vegan options, Amazonian clay'
  },
  'urban-decay': {
    description: 'Edgy beauty brand known for bold colors and long-wearing formulas. Signature products include Naked palettes, All Nighter Setting Spray, and Vice Lipstick. Cruelty-free, bold aesthetic, professional quality.',
    notes: 'Bold colors, long-wearing, Naked palettes, edgy aesthetic'
  },
  'too-faced': {
    description: 'Playful beauty brand known for fun packaging and scented products. Signature items include Better Than Sex Mascara, Born This Way Foundation, and Chocolate Bar palettes. Cruelty-free, fun aesthetic.',
    notes: 'Playful, scented products, fun packaging, cruelty-free'
  },
  'benefit-cosmetics': {
    description: 'Fun beauty brand specializing in brows, bronzers, and easy-to-use products. Known for They\'re Real! Mascara, Hoola Bronzer, and Gimme Brow. Playful packaging, professional results, accessible.',
    notes: 'Brow specialist, fun packaging, easy-to-use, professional results'
  },
  'nars': {
    description: 'Luxury makeup brand known for high-pigment formulas and iconic products. Signature items include Orgasm blush, Radiant Creamy Concealer, and Velvet Matte Lip Pencil. Professional quality, bold colors.',
    notes: 'Luxury, high-pigment, iconic products, professional quality'
  },
  'milk-makeup': {
    description: 'Vegan, cruelty-free beauty brand offering innovative, easy-to-use products. Known for Kush Mascara, Hydro Grip Primer, and stick formulas. Clean ingredients, portable packaging, millennial-focused.',
    notes: 'Vegan, cruelty-free, innovative, stick formulas, clean ingredients'
  },
  'ilia-beauty': {
    description: 'Clean beauty brand combining skincare benefits with makeup. Known for True Skin Serum Foundation, Limitless Lash Mascara, and multi-stick products. Clean ingredients, SPF options, sustainable packaging.',
    notes: 'Clean beauty, skincare-makeup hybrid, SPF, sustainable'
  },
  'kosas': {
    description: 'Clean beauty brand offering makeup with skincare benefits. Known for Revealer Concealer, Weightless Lip Color, and 10-Second Shadow. Clean ingredients, skin-loving formulas, minimal packaging.',
    notes: 'Clean beauty, skincare benefits, minimal, skin-loving'
  },
  'merit-beauty': {
    description: 'Minimalist clean beauty brand offering essential makeup products. Known for The Minimalist Perfecting Complexion Stick, Clean Lash Lengthening Mascara, and Shade Slick Tinted Lip Oil. Clean, minimal, essential.',
    notes: 'Minimalist, clean, essential products, simple routine'
  },
  'saie-beauty': {
    description: 'Clean beauty brand focused on effortless, natural-looking makeup. Known for Slip Tint, Glowy Super Gel, and Dew Blush. Clean ingredients, dewy finish, easy application.',
    notes: 'Clean beauty, natural finish, dewy, effortless'
  },
  'rose-inc': {
    description: 'Clean beauty brand by Rosie Huntington-Whiteley offering elevated essentials. Known for Skin Enhance Luminous Tinted Serum, Blush Divine Radiant Lip & Cheek Color, and Satin Lip Color. Clean, luxurious, essential.',
    notes: 'Rosie HW brand, clean, luxurious essentials, elevated'
  },
  'lawless-beauty': {
    description: 'Clean beauty brand offering high-performance makeup with clean ingredients. Known for One-Step Foundation, Forget The Filler Lip Plumper, and Velvet Matte Lipstick. Clean, high-performance, vegan.',
    notes: 'Clean beauty, high-performance, vegan, clean ingredients'
  },
  'jones-road-beauty': {
    description: 'Clean beauty brand by Bobbi Brown offering "no-makeup makeup" essentials. Known for What The Foundation, The Face Pencil, and Miracle Balm. Clean ingredients, natural finish, essential products.',
    notes: 'Bobbi Brown brand, no-makeup makeup, clean, natural finish'
  },
  'westman-atelier': {
    description: 'Luxury clean beauty brand by Gucci Westman offering high-performance essentials. Known for Vital Skin Foundation Stick, Baby Cheeks Blush Stick, and Super Loaded Tinted Highlight. Clean, luxury, essential.',
    notes: 'Gucci Westman, luxury clean beauty, high-performance, essential'
  },
  'charlotte-tilbury': {
    description: 'Luxury beauty brand offering glamorous, easy-to-use makeup. Known for Magic Foundation, Pillow Talk lipstick, and Instant Look in a Palette. Professional quality, glamorous aesthetic, accessible luxury.',
    notes: 'Luxury, glamorous, professional quality, accessible luxury'
  },
  'pat-mcgrath-labs': {
    description: 'Luxury makeup brand by Pat McGrath offering high-fashion, high-pigment cosmetics. Known for Mothership palettes, MatteTrance Lipstick, and Sublime Perfection Foundation. Professional quality, high-fashion, luxury.',
    notes: 'Pat McGrath, luxury, high-fashion, high-pigment, professional'
  },
  'huda-beauty': {
    description: 'Beauty brand by Huda Kattan offering high-pigment, long-wearing makeup. Known for #FauxFilter Foundation, Obsessions palettes, and Legit Lashes Mascara. High-pigment, long-wearing, influencer-founded.',
    notes: 'Huda Kattan, high-pigment, long-wearing, influencer brand'
  },
  'fenty-skin': {
    description: 'Clean skincare line by Rihanna offering effective, accessible products. Known for Fat Water Pore-Refining Toner Serum, Total Cleans\'r, and Hydra Vizor Invisible Moisturizer. Clean, effective, accessible.',
    notes: 'Rihanna skincare, clean, effective, accessible'
  },
  'the-inkey-list': {
    description: 'Affordable skincare brand offering effective, ingredient-focused products. Known for Oat Cleansing Balm, Retinol serum, and Hyaluronic Acid serum. Under $15, ingredient-focused, effective.',
    notes: 'Affordable, ingredient-focused, under $15, effective'
  },
  'good-molecules': {
    description: 'Affordable skincare brand offering effective, science-backed products. Known for Niacinamide Brightening Toner, Discoloration Correcting Serum, and Hyaluronic Acid Boosting Essence. Under $12, effective, science-backed.',
    notes: 'Affordable, science-backed, under $12, effective'
  },
  'paulas-choice': {
    description: 'Skincare brand founded by Paula Begoun offering science-backed, effective products. Known for 2% BHA Liquid Exfoliant, Resist Anti-Aging line, and Clinical 1% Retinol. Science-backed, effective, no-nonsense.',
    notes: 'Paula Begoun, science-backed, effective, no-nonsense'
  },
  'cetaphil': {
    description: 'Gentle skincare brand offering dermatologist-recommended products for sensitive skin. Known for Gentle Skin Cleanser, Daily Facial Moisturizer, and Restoraderm body care. Gentle, dermatologist-recommended, sensitive skin.',
    notes: 'Gentle, dermatologist-recommended, sensitive skin, accessible'
  },
  'cerave': {
    description: 'Skincare brand developed with dermatologists offering effective, accessible products. Known for Foaming Facial Cleanser, Daily Moisturizing Lotion, and Resurfacing Retinol Serum. Ceramides, accessible, dermatologist-developed.',
    notes: 'Dermatologist-developed, ceramides, accessible, effective'
  },
  'la-roche-posay': {
    description: 'French pharmacy skincare brand offering dermatologist-tested, effective products. Known for Toleriane line, Anthelios sunscreen, and Effaclar acne treatment. French pharmacy, dermatologist-tested, effective.',
    notes: 'French pharmacy, dermatologist-tested, effective, accessible'
  },
  'aveeno': {
    description: 'Skincare brand using natural oat ingredients for gentle, effective products. Known for Daily Moisturizing Lotion, Positively Radiant line, and Baby care products. Oat-based, gentle, natural ingredients.',
    notes: 'Oat-based, gentle, natural ingredients, accessible'
  },
  'neutrogena': {
    description: 'Skincare brand offering dermatologist-recommended, accessible products. Known for Hydro Boost line, Ultra Gentle Cleanser, and Rapid Wrinkle Repair. Dermatologist-recommended, accessible, effective.',
    notes: 'Dermatologist-recommended, accessible, effective, wide range'
  },
  'olay': {
    description: 'Skincare brand offering anti-aging and daily care products. Known for Regenerist line, Total Effects, and Retinol24. Anti-aging focus, accessible, effective formulas.',
    notes: 'Anti-aging, accessible, effective, wide range'
  },
  'dove': {
    description: 'Personal care brand offering gentle, moisturizing products for body and face. Known for Beauty Bar, Body Wash, and Hair Care. Gentle, moisturizing, accessible, body-positive messaging.',
    notes: 'Gentle, moisturizing, accessible, body-positive'
  },
  'garnier': {
    description: 'French beauty brand offering affordable skincare, hair care, and makeup. Known for Micellar Water, Hair Color, and SkinActive line. Affordable, accessible, wide range, French heritage.',
    notes: 'Affordable, accessible, wide range, French heritage'
  },
  'loreal': {
    description: 'French beauty conglomerate offering accessible luxury across makeup, skincare, and hair care. Known for True Match Foundation, Revitalift skincare, and Professional hair care. Accessible luxury, wide range, innovation.',
    notes: 'Accessible luxury, wide range, innovation, French heritage'
  },
  'maybelline': {
    description: 'Affordable makeup brand offering accessible, trend-driven cosmetics. Known for Great Lash Mascara, Fit Me Foundation, and SuperStay Lip Color. Affordable, accessible, trend-driven, wide range.',
    notes: 'Affordable, accessible, trend-driven, wide range'
  },
  'covergirl': {
    description: 'Cruelty-free makeup brand offering accessible, inclusive cosmetics. Known for Clean Makeup line, Lash Blast Mascara, and Outlast Lip Color. Cruelty-free, accessible, inclusive, wide range.',
    notes: 'Cruelty-free, accessible, inclusive, wide range'
  },
  'wet-n-wild-beauty': {
    description: 'Ultra-affordable makeup brand offering quality cosmetics under $10. Known for Photo Focus Foundation, MegaGlo Highlighters, and Color Icon palettes. Ultra-affordable, quality, under $10, cruelty-free.',
    notes: 'Ultra-affordable, quality, under $10, cruelty-free'
  },
  'elf-cosmetics': {
    description: 'Affordable makeup and skincare brand offering quality products under $15. Known for Poreless Putty Primer, 16HR Camo Concealer, and Holy Hydration skincare. Affordable, quality, under $15, cruelty-free.',
    notes: 'Affordable, quality, under $15, cruelty-free, wide range'
  },
  'nyx-professional-makeup': {
    description: 'Professional makeup brand offering high-quality, accessible cosmetics. Known for Butter Gloss, Can\'t Stop Won\'t Stop Foundation, and Ultimate Shadow Palettes. Professional quality, accessible, wide range.',
    notes: 'Professional quality, accessible, wide range, cruelty-free'
  },
  'physicians-formula': {
    description: 'Hypoallergenic makeup brand offering gentle, dermatologist-tested cosmetics. Known for Butter Bronzer, Healthy Foundation, and Organic Wear line. Hypoallergenic, gentle, dermatologist-tested, accessible.',
    notes: 'Hypoallergenic, gentle, dermatologist-tested, accessible'
  },
  'bareminerals': {
    description: 'Clean beauty brand offering mineral-based makeup and skincare. Known for Original Loose Powder Foundation, Complexion Rescue, and Skinlongevity skincare. Clean, mineral-based, natural finish.',
    notes: 'Clean, mineral-based, natural finish, accessible'
  },
  'it-cosmetics': {
    description: 'Skincare-makeup hybrid brand offering products with skincare benefits. Known for CC+ Cream, Bye Bye Under Eye Concealer, and Confidence in a Cream. Skincare benefits, full coverage, accessible luxury.',
    notes: 'Skincare-makeup hybrid, full coverage, accessible luxury'
  },
  'clinique': {
    description: 'Dermatologist-developed skincare and makeup brand offering allergy-tested products. Known for 3-Step Skincare System, Even Better Foundation, and Dramatically Different Moisturizing Lotion. Allergy-tested, dermatologist-developed, accessible luxury.',
    notes: 'Allergy-tested, dermatologist-developed, accessible luxury'
  },
  'estee-lauder': {
    description: 'Luxury beauty brand offering high-performance skincare and makeup. Known for Advanced Night Repair, Double Wear Foundation, and Re-Nutriv line. Luxury, high-performance, innovation, heritage brand.',
    notes: 'Luxury, high-performance, innovation, heritage brand'
  },
  'lancome': {
    description: 'French luxury beauty brand offering sophisticated skincare and makeup. Known for Teint Idole Foundation, Advanced Génifique serum, and Hypnôse Mascara. French luxury, sophisticated, innovation.',
    notes: 'French luxury, sophisticated, innovation, heritage brand'
  },
  'ysl-beauty': {
    description: 'Luxury beauty brand offering glamorous, high-performance cosmetics. Known for Touche Éclat, All Hours Foundation, and Rouge Pur Couture lipstick. Luxury, glamorous, high-performance, French heritage.',
    notes: 'Luxury, glamorous, high-performance, French heritage'
  },
  'dior-beauty': {
    description: 'Luxury beauty brand offering sophisticated, high-performance cosmetics and skincare. Known for Forever Foundation, Capture Totale skincare, and Rouge Dior lipstick. Luxury, sophisticated, high-performance, French heritage.',
    notes: 'Luxury, sophisticated, high-performance, French heritage'
  },
  'chanel-beauty': {
    description: 'Luxury beauty brand offering timeless, sophisticated cosmetics and skincare. Known for Vitalumière Foundation, Le Lift skincare, and Rouge Coco lipstick. Luxury, timeless, sophisticated, French heritage.',
    notes: 'Luxury, timeless, sophisticated, French heritage'
  },
  'tom-ford-beauty': {
    description: 'Luxury beauty brand offering sophisticated, high-performance cosmetics. Known for Traceless Foundation, Eye Color Quad palettes, and Lip Color. Luxury, sophisticated, high-performance, designer brand.',
    notes: 'Luxury, sophisticated, high-performance, designer brand'
  },
  'hourglass-cosmetics': {
    description: 'Luxury vegan beauty brand offering high-performance, innovative cosmetics. Known for Ambient Lighting Powders, Vanish Foundation Stick, and Unlocked Mascara. Luxury, vegan, high-performance, innovative.',
    notes: 'Luxury, vegan, high-performance, innovative'
  },
  'marc-jacobs-beauty': {
    description: 'Luxury beauty brand offering high-fashion, high-performance cosmetics. Known for Re(marc)able Foundation, Enamored Hi-Shine Lip Lacquer, and Velvet Noir Mascara. Luxury, high-fashion, high-performance, designer brand.',
    notes: 'Luxury, high-fashion, high-performance, designer brand'
  },
  'nudestix': {
    description: 'Canadian clean beauty brand offering easy-to-use, multi-purpose products. Known for Nudies Matte Blush & Bronze, Magnetic Eye Color, and Lip + Cheek Pencil. Clean, easy-to-use, multi-purpose, portable.',
    notes: 'Canadian, clean, easy-to-use, multi-purpose, portable'
  },
  'ilia-beauty': {
    description: 'Clean beauty brand combining skincare benefits with makeup. Known for True Skin Serum Foundation, Limitless Lash Mascara, and multi-stick products. Clean ingredients, SPF options, sustainable packaging.',
    notes: 'Clean beauty, skincare-makeup hybrid, SPF, sustainable'
  },
  'kosas': {
    description: 'Clean beauty brand offering makeup with skincare benefits. Known for Revealer Concealer, Weightless Lip Color, and 10-Second Shadow. Clean ingredients, skin-loving formulas, minimal packaging.',
    notes: 'Clean beauty, skincare benefits, minimal, skin-loving'
  },
  'merit-beauty': {
    description: 'Minimalist clean beauty brand offering essential makeup products. Known for The Minimalist Perfecting Complexion Stick, Clean Lash Lengthening Mascara, and Shade Slick Tinted Lip Oil. Clean, minimal, essential.',
    notes: 'Minimalist, clean, essential products, simple routine'
  },
  'saie-beauty': {
    description: 'Clean beauty brand focused on effortless, natural-looking makeup. Known for Slip Tint, Glowy Super Gel, and Dew Blush. Clean ingredients, dewy finish, easy application.',
    notes: 'Clean beauty, natural finish, dewy, effortless'
  },
  'rose-inc': {
    description: 'Clean beauty brand by Rosie Huntington-Whiteley offering elevated essentials. Known for Skin Enhance Luminous Tinted Serum, Blush Divine Radiant Lip & Cheek Color, and Satin Lip Color. Clean, luxurious, essential.',
    notes: 'Rosie HW brand, clean, luxurious essentials, elevated'
  },
  'lawless-beauty': {
    description: 'Clean beauty brand offering high-performance makeup with clean ingredients. Known for One-Step Foundation, Forget The Filler Lip Plumper, and Velvet Matte Lipstick. Clean, high-performance, vegan.',
    notes: 'Clean beauty, high-performance, vegan, clean ingredients'
  },
  'jones-road-beauty': {
    description: 'Clean beauty brand by Bobbi Brown offering "no-makeup makeup" essentials. Known for What The Foundation, The Face Pencil, and Miracle Balm. Clean ingredients, natural finish, essential products.',
    notes: 'Bobbi Brown brand, no-makeup makeup, clean, natural finish'
  },
  'westman-atelier': {
    description: 'Luxury clean beauty brand by Gucci Westman offering high-performance essentials. Known for Vital Skin Foundation Stick, Baby Cheeks Blush Stick, and Super Loaded Tinted Highlight. Clean, luxury, essential.',
    notes: 'Gucci Westman, luxury clean beauty, high-performance, essential'
  },
  'charlotte-tilbury': {
    description: 'Luxury beauty brand offering glamorous, easy-to-use makeup. Known for Magic Foundation, Pillow Talk lipstick, and Instant Look in a Palette. Professional quality, glamorous aesthetic, accessible luxury.',
    notes: 'Luxury, glamorous, professional quality, accessible luxury'
  },
  'pat-mcgrath-labs': {
    description: 'Luxury makeup brand by Pat McGrath offering high-fashion, high-pigment cosmetics. Known for Mothership palettes, MatteTrance Lipstick, and Sublime Perfection Foundation. Professional quality, high-fashion, luxury.',
    notes: 'Pat McGrath, luxury, high-fashion, high-pigment, professional'
  },
  'huda-beauty': {
    description: 'Beauty brand by Huda Kattan offering high-pigment, long-wearing makeup. Known for #FauxFilter Foundation, Obsessions palettes, and Legit Lashes Mascara. High-pigment, long-wearing, influencer-founded.',
    notes: 'Huda Kattan, high-pigment, long-wearing, influencer brand'
  },
  'fenty-skin': {
    description: 'Clean skincare line by Rihanna offering effective, accessible products. Known for Fat Water Pore-Refining Toner Serum, Total Cleans\'r, and Hydra Vizor Invisible Moisturizer. Clean, effective, accessible.',
    notes: 'Rihanna skincare, clean, effective, accessible'
  },
  'the-inkey-list': {
    description: 'Affordable skincare brand offering effective, ingredient-focused products. Known for Oat Cleansing Balm, Retinol serum, and Hyaluronic Acid serum. Under $15, ingredient-focused, effective.',
    notes: 'Affordable, ingredient-focused, under $15, effective'
  },
  'good-molecules': {
    description: 'Affordable skincare brand offering effective, science-backed products. Known for Niacinamide Brightening Toner, Discoloration Correcting Serum, and Hyaluronic Acid Boosting Essence. Under $12, effective, science-backed.',
    notes: 'Affordable, science-backed, under $12, effective'
  },
  'paulas-choice': {
    description: 'Skincare brand founded by Paula Begoun offering science-backed, effective products. Known for 2% BHA Liquid Exfoliant, Resist Anti-Aging line, and Clinical 1% Retinol. Science-backed, effective, no-nonsense.',
    notes: 'Paula Begoun, science-backed, effective, no-nonsense'
  },
  'cetaphil': {
    description: 'Gentle skincare brand offering dermatologist-recommended products for sensitive skin. Known for Gentle Skin Cleanser, Daily Facial Moisturizer, and Restoraderm body care. Gentle, dermatologist-recommended, sensitive skin.',
    notes: 'Gentle, dermatologist-recommended, sensitive skin, accessible'
  },
  'cerave': {
    description: 'Skincare brand developed with dermatologists offering effective, accessible products. Known for Foaming Facial Cleanser, Daily Moisturizing Lotion, and Resurfacing Retinol Serum. Ceramides, accessible, dermatologist-developed.',
    notes: 'Dermatologist-developed, ceramides, accessible, effective'
  },
  'la-roche-posay': {
    description: 'French pharmacy skincare brand offering dermatologist-tested, effective products. Known for Toleriane line, Anthelios sunscreen, and Effaclar acne treatment. French pharmacy, dermatologist-tested, effective.',
    notes: 'French pharmacy, dermatologist-tested, effective, accessible'
  },
  'aveeno': {
    description: 'Skincare brand using natural oat ingredients for gentle, effective products. Known for Daily Moisturizing Lotion, Positively Radiant line, and Baby care products. Oat-based, gentle, natural ingredients.',
    notes: 'Oat-based, gentle, natural ingredients, accessible'
  },
  'neutrogena': {
    description: 'Skincare brand offering dermatologist-recommended, accessible products. Known for Hydro Boost line, Ultra Gentle Cleanser, and Rapid Wrinkle Repair. Dermatologist-recommended, accessible, effective.',
    notes: 'Dermatologist-recommended, accessible, effective, wide range'
  },
  'olay': {
    description: 'Skincare brand offering anti-aging and daily care products. Known for Regenerist line, Total Effects, and Retinol24. Anti-aging focus, accessible, effective formulas.',
    notes: 'Anti-aging, accessible, effective, wide range'
  },
  'dove': {
    description: 'Personal care brand offering gentle, moisturizing products for body and face. Known for Beauty Bar, Body Wash, and Hair Care. Gentle, moisturizing, accessible, body-positive messaging.',
    notes: 'Gentle, moisturizing, accessible, body-positive'
  },
  'garnier': {
    description: 'French beauty brand offering affordable skincare, hair care, and makeup. Known for Micellar Water, Hair Color, and SkinActive line. Affordable, accessible, wide range, French heritage.',
    notes: 'Affordable, accessible, wide range, French heritage'
  },
  'loreal': {
    description: 'French beauty conglomerate offering accessible luxury across makeup, skincare, and hair care. Known for True Match Foundation, Revitalift skincare, and Professional hair care. Accessible luxury, wide range, innovation.',
    notes: 'Accessible luxury, wide range, innovation, French heritage'
  },
  'maybelline': {
    description: 'Affordable makeup brand offering accessible, trend-driven cosmetics. Known for Great Lash Mascara, Fit Me Foundation, and SuperStay Lip Color. Affordable, accessible, trend-driven, wide range.',
    notes: 'Affordable, accessible, trend-driven, wide range'
  },
  'covergirl': {
    description: 'Cruelty-free makeup brand offering accessible, inclusive cosmetics. Known for Clean Makeup line, Lash Blast Mascara, and Outlast Lip Color. Cruelty-free, accessible, inclusive, wide range.',
    notes: 'Cruelty-free, accessible, inclusive, wide range'
  },
  'wet-n-wild-beauty': {
    description: 'Ultra-affordable makeup brand offering quality cosmetics under $10. Known for Photo Focus Foundation, MegaGlo Highlighters, and Color Icon palettes. Ultra-affordable, quality, under $10, cruelty-free.',
    notes: 'Ultra-affordable, quality, under $10, cruelty-free'
  },
  'elf-cosmetics': {
    description: 'Affordable makeup and skincare brand offering quality products under $15. Known for Poreless Putty Primer, 16HR Camo Concealer, and Holy Hydration skincare. Affordable, quality, under $15, cruelty-free.',
    notes: 'Affordable, quality, under $15, cruelty-free, wide range'
  },
  'nyx-professional-makeup': {
    description: 'Professional makeup brand offering high-quality, accessible cosmetics. Known for Butter Gloss, Can\'t Stop Won\'t Stop Foundation, and Ultimate Shadow Palettes. Professional quality, accessible, wide range.',
    notes: 'Professional quality, accessible, wide range, cruelty-free'
  },
  'physicians-formula': {
    description: 'Hypoallergenic makeup brand offering gentle, dermatologist-tested cosmetics. Known for Butter Bronzer, Healthy Foundation, and Organic Wear line. Hypoallergenic, gentle, dermatologist-tested, accessible.',
    notes: 'Hypoallergenic, gentle, dermatologist-tested, accessible'
  },
  'bareminerals': {
    description: 'Clean beauty brand offering mineral-based makeup and skincare. Known for Original Loose Powder Foundation, Complexion Rescue, and Skinlongevity skincare. Clean, mineral-based, natural finish.',
    notes: 'Clean, mineral-based, natural finish, accessible'
  },
  'it-cosmetics': {
    description: 'Skincare-makeup hybrid brand offering products with skincare benefits. Known for CC+ Cream, Bye Bye Under Eye Concealer, and Confidence in a Cream. Skincare benefits, full coverage, accessible luxury.',
    notes: 'Skincare-makeup hybrid, full coverage, accessible luxury'
  },
  'clinique': {
    description: 'Dermatologist-developed skincare and makeup brand offering allergy-tested products. Known for 3-Step Skincare System, Even Better Foundation, and Dramatically Different Moisturizing Lotion. Allergy-tested, dermatologist-developed, accessible luxury.',
    notes: 'Allergy-tested, dermatologist-developed, accessible luxury'
  },
  'estee-lauder': {
    description: 'Luxury beauty brand offering high-performance skincare and makeup. Known for Advanced Night Repair, Double Wear Foundation, and Re-Nutriv line. Luxury, high-performance, innovation, heritage brand.',
    notes: 'Luxury, high-performance, innovation, heritage brand'
  },
  'lancome': {
    description: 'French luxury beauty brand offering sophisticated skincare and makeup. Known for Teint Idole Foundation, Advanced Génifique serum, and Hypnôse Mascara. French luxury, sophisticated, innovation.',
    notes: 'French luxury, sophisticated, innovation, heritage brand'
  },
  'ysl-beauty': {
    description: 'Luxury beauty brand offering glamorous, high-performance cosmetics. Known for Touche Éclat, All Hours Foundation, and Rouge Pur Couture lipstick. Luxury, glamorous, high-performance, French heritage.',
    notes: 'Luxury, glamorous, high-performance, French heritage'
  },
  'dior-beauty': {
    description: 'Luxury beauty brand offering sophisticated, high-performance cosmetics and skincare. Known for Forever Foundation, Capture Totale skincare, and Rouge Dior lipstick. Luxury, sophisticated, high-performance, French heritage.',
    notes: 'Luxury, sophisticated, high-performance, French heritage'
  },
  'chanel-beauty': {
    description: 'Luxury beauty brand offering timeless, sophisticated cosmetics and skincare. Known for Vitalumière Foundation, Le Lift skincare, and Rouge Coco lipstick. Luxury, timeless, sophisticated, French heritage.',
    notes: 'Luxury, timeless, sophisticated, French heritage'
  },
  'tom-ford-beauty': {
    description: 'Luxury beauty brand offering sophisticated, high-performance cosmetics. Known for Traceless Foundation, Eye Color Quad palettes, and Lip Color. Luxury, sophisticated, high-performance, designer brand.',
    notes: 'Luxury, sophisticated, high-performance, designer brand'
  },
  'hourglass-cosmetics': {
    description: 'Luxury vegan beauty brand offering high-performance, innovative cosmetics. Known for Ambient Lighting Powders, Vanish Foundation Stick, and Unlocked Mascara. Luxury, vegan, high-performance, innovative.',
    notes: 'Luxury, vegan, high-performance, innovative'
  },
  'marc-jacobs-beauty': {
    description: 'Luxury beauty brand offering high-fashion, high-performance cosmetics. Known for Re(marc)able Foundation, Enamored Hi-Shine Lip Lacquer, and Velvet Noir Mascara. Luxury, high-fashion, high-performance, designer brand.',
    notes: 'Luxury, high-fashion, high-performance, designer brand'
  },
  'nudestix': {
    description: 'Canadian clean beauty brand offering easy-to-use, multi-purpose products. Known for Nudies Matte Blush & Bronze, Magnetic Eye Color, and Lip + Cheek Pencil. Clean, easy-to-use, multi-purpose, portable.',
    notes: 'Canadian, clean, easy-to-use, multi-purpose, portable'
  },
  // Fashion brands
  'lounge-underwear': {
    description: 'Australian intimates brand offering comfortable, stylish underwear and loungewear. Known for seamless designs, soft fabrics, and inclusive sizing. Australian, comfortable, stylish, inclusive.',
    notes: 'Australian intimates, comfortable, inclusive sizing'
  },
  'showpo': {
    description: 'Australian fast-fashion brand offering trendy, affordable clothing and accessories. Known for party dresses, going-out outfits, and influencer collaborations. Australian, trendy, affordable, fast-fashion.',
    notes: 'Australian fast-fashion, trendy, affordable, influencer collabs'
  },
  'prettylittlething': {
    description: 'UK-based fast-fashion brand offering trendy, affordable clothing and accessories. Known for party wear, going-out outfits, and inclusive sizing. UK, trendy, affordable, inclusive, fast-fashion.',
    notes: 'UK fast-fashion, trendy, affordable, inclusive sizing'
  },
  'meshki': {
    description: 'Australian fashion brand offering trendy, affordable clothing with focus on going-out wear. Known for bodycon dresses, two-piece sets, and influencer collaborations. Australian, trendy, affordable, going-out wear.',
    notes: 'Australian fashion, trendy, going-out wear, affordable'
  },
  'pepper-mayo': {
    description: 'Australian intimates brand specializing in comfortable, supportive bras for smaller busts. Known for wireless bras, bralettes, and inclusive sizing. Australian, small bust specialist, comfortable, supportive.',
    notes: 'Australian intimates, small bust specialist, comfortable'
  },
  'oh-polly': {
    description: 'UK-based fast-fashion brand offering trendy, bodycon clothing and going-out outfits. Known for two-piece sets, party dresses, and influencer collaborations. UK, trendy, bodycon, going-out wear.',
    notes: 'UK fast-fashion, trendy, bodycon, going-out wear'
  },
  'girlfriend-collective': {
    description: 'Sustainable activewear brand offering eco-friendly, size-inclusive athletic wear. Known for leggings made from recycled water bottles, sports bras, and matching sets. Sustainable, size-inclusive, eco-friendly.',
    notes: 'Sustainable activewear, eco-friendly, size-inclusive, recycled materials'
  },
  // Lifestyle brands
  'pela-case': {
    description: 'Sustainable phone case brand offering compostable, eco-friendly phone cases and accessories. Known for biodegradable materials, impact protection, and environmental mission. Sustainable, compostable, eco-friendly.',
    notes: 'Sustainable phone cases, compostable, eco-friendly, biodegradable'
  },
  'brooklinen': {
    description: 'Direct-to-consumer bedding brand offering premium, affordable sheets and home essentials. Known for Luxe Sateen sheets, Down Alternative Comforter, and hotel-quality bedding. DTC, premium, affordable, hotel-quality.',
    notes: 'DTC bedding, premium, affordable, hotel-quality'
  },
  'casetify': {
    description: 'Customizable phone case brand offering protective, personalized cases and tech accessories. Known for Impact cases, MagSafe compatibility, and extensive design options. Customizable, protective, personalized.',
    notes: 'Customizable phone cases, protective, personalized, MagSafe'
  },
  // Tech brands
  'hyperx': {
    description: 'Gaming peripherals brand offering high-quality headsets, keyboards, and gaming accessories. Known for Cloud headsets, Alloy keyboards, and Pulsefire mice. Gaming, high-quality, professional-grade.',
    notes: 'Gaming peripherals, headsets, keyboards, professional-grade'
  },
  'elgato': {
    description: 'Content creation tech brand offering streaming equipment, capture cards, and studio accessories. Known for Stream Deck, FaceCam, and Key Light. Content creation, streaming, professional-grade.',
    notes: 'Content creation, streaming equipment, professional-grade'
  },
  'steelseries': {
    description: 'Gaming peripherals brand offering high-performance headsets, keyboards, and mice. Known for Arctis headsets, Apex keyboards, and Rival mice. Gaming, high-performance, professional-grade.',
    notes: 'Gaming peripherals, high-performance, professional-grade'
  },
  'blue-microphones': {
    description: 'Audio equipment brand offering professional microphones and recording accessories. Known for Yeti USB microphones, Snowball, and professional recording solutions. Audio, professional-grade, USB microphones.',
    notes: 'Audio equipment, professional microphones, USB, recording'
  },
  // Food brands
  'magic-spoon': {
    description: 'High-protein, low-carb cereal brand offering keto-friendly breakfast options. Known for zero-sugar cereals, high protein content, and nostalgic flavors. Keto-friendly, high-protein, zero-sugar.',
    notes: 'Keto cereal, high-protein, zero-sugar, nostalgic flavors'
  },
  'chomps': {
    description: 'Clean meat snack brand offering grass-fed beef sticks and jerky. Known for whole30-approved, paleo-friendly snacks with no artificial ingredients. Clean, grass-fed, whole30, paleo-friendly.',
    notes: 'Clean meat snacks, grass-fed, whole30, paleo-friendly'
  },
  // Accessories brands
  'mejuri': {
    description: 'Fine jewelry brand offering affordable, everyday luxury pieces. Known for dainty gold jewelry, minimalist designs, and direct-to-consumer model. Fine jewelry, affordable luxury, minimalist, DTC.',
    notes: 'Fine jewelry, affordable luxury, minimalist, DTC'
  },
  'missoma': {
    description: 'Contemporary jewelry brand offering affordable, layered gold and silver pieces. Known for layering necklaces, stackable rings, and mix-and-match designs. Contemporary, affordable, layering, mix-and-match.',
    notes: 'Contemporary jewelry, affordable, layering, mix-and-match'
  },
  // Gaming brands
  'gfuel': {
    description: 'Gaming energy drink brand offering sugar-free, caffeinated energy formulas. Known for powder energy drinks, hydration formulas, and gaming influencer collaborations. Gaming, sugar-free, caffeinated, influencer collabs.',
    notes: 'Gaming energy drinks, sugar-free, caffeinated, influencer collabs'
  },
  // Other brands
  'kylie-cosmetics': {
    description: 'Beauty brand by Kylie Jenner offering lip kits, makeup, and skincare. Known for Lip Kits, Kylighters, and Kylie Skin line. Celebrity brand, lip kits, accessible luxury.',
    notes: 'Kylie Jenner brand, lip kits, celebrity brand, accessible luxury'
  },
  // Additional brands
  'liquid-iv': {
    description: 'Hydration multiplier brand offering electrolyte drink mixes for rapid hydration. Known for Hydration Multiplier packets, Energy Multiplier, and Sleep Multiplier. Rapid hydration, electrolyte-focused, portable.',
    notes: 'Hydration drinks, electrolytes, rapid hydration, portable'
  },
  'olly': {
    description: 'Wellness supplement brand offering gummy vitamins and functional supplements. Known for gummy vitamins, sleep supplements, and energy boosters. Gummy format, functional supplements, accessible wellness.',
    notes: 'Gummy vitamins, functional supplements, accessible wellness'
  },
  'peach-lily': {
    description: 'K-beauty skincare brand offering Korean-inspired, effective skincare products. Known for Glass Skin Refining Serum, Power Calm Hydrating Gel Cleanser, and K-beauty innovations. K-beauty, Korean-inspired, effective.',
    notes: 'K-beauty, Korean-inspired, effective, glass skin'
  },
  'ana-luisa': {
    description: 'Sustainable jewelry brand offering affordable, trendy gold and silver pieces. Known for layered necklaces, stackable rings, and mix-and-match designs. Sustainable, affordable, trendy, mix-and-match.',
    notes: 'Sustainable jewelry, affordable, trendy, mix-and-match'
  },
  'drunk-elephant-skincare': {
    description: 'Clean skincare brand focused on biocompatible ingredients and pH-balanced formulas. Known for C-Firma Vitamin C serum, Protini Polypeptide cream, and "suspicious 6" free philosophy. Clean, biocompatible, pH-balanced.',
    notes: 'Clean beauty, biocompatible, pH-balanced, no fragrance'
  },
  'shopbop': {
    description: 'Online fashion retailer offering curated selection of designer and contemporary brands. Known for designer clothing, shoes, accessories, and exclusive collaborations. Curated, designer, contemporary, online retailer.',
    notes: 'Online fashion retailer, curated, designer, contemporary'
  },
  'banana-republic': {
    description: 'Contemporary fashion brand offering sophisticated, work-appropriate clothing and accessories. Known for tailored pieces, cashmere, leather goods, and professional attire. Contemporary, sophisticated, work-appropriate.',
    notes: 'Contemporary fashion, sophisticated, work-appropriate, tailored'
  },
  'casper-sleep': {
    description: 'Direct-to-consumer mattress and sleep brand offering quality bedding and sleep accessories. Known for memory foam mattresses, sheets, and sleep accessories. DTC, quality, memory foam, sleep-focused.',
    notes: 'DTC mattress, memory foam, quality, sleep-focused'
  },
  'ganni-as': {
    description: 'Danish contemporary fashion brand offering playful, trend-driven clothing and accessories. Known for statement pieces, colorful designs, and Scandi-cool aesthetic. Danish, contemporary, playful, trend-driven.',
    notes: 'Danish fashion, contemporary, playful, Scandi-cool'
  },
  'herbivore-botanicals': {
    description: 'Clean skincare brand offering botanical-powered, effective products. Known for Blue Tansy mask, Pink Cloud cleanser, and natural ingredients. Clean, botanical-powered, natural ingredients, effective.',
    notes: 'Clean skincare, botanical-powered, natural ingredients, effective'
  },
  // More brands
  'naked-sundays': {
    description: 'Australian SPF-focused skincare brand offering high-protection, cosmetically elegant sunscreens. Known for SPF50+ formulas, glow-enhancing textures, and reef-safe ingredients. Australian, SPF-focused, cosmetically elegant, reef-safe.',
    notes: 'Australian SPF brand, high protection, cosmetically elegant, reef-safe'
  },
  'olaplex': {
    description: 'Hair repair brand offering bond-building treatments for damaged hair. Known for No.3 Hair Perfector, No.6 Bond Smoother, and patented bond-building technology. Bond-building, hair repair, professional-grade, patented technology.',
    notes: 'Hair repair, bond-building, professional-grade, patented technology'
  },
  'olipop': {
    description: 'Prebiotic soda brand offering gut-healthy, low-sugar sparkling beverages. Known for prebiotic fiber, natural flavors, and functional benefits. Prebiotic, gut-healthy, low-sugar, functional beverages.',
    notes: 'Prebiotic soda, gut-healthy, low-sugar, functional'
  },
  'popsockets': {
    description: 'Phone accessory brand offering grip and stand solutions for mobile devices. Known for PopGrip, PopWallet, and customizable designs. Phone accessories, grip, stand, customizable.',
    notes: 'Phone accessories, grip, stand, customizable'
  },
  'secretlab': {
    description: 'Gaming chair brand offering ergonomic, high-quality seating for gamers and professionals. Known for Titan and Omega series, premium materials, and ergonomic design. Gaming chairs, ergonomic, premium, professional-grade.',
    notes: 'Gaming chairs, ergonomic, premium, professional-grade'
  },
  'verb': {
    description: 'Hair care brand offering salon-quality products at accessible prices. Known for Ghost Shampoo, Sea Salt Spray, and professional formulas. Salon-quality, accessible, professional formulas.',
    notes: 'Hair care, salon-quality, accessible, professional'
  },
  'princess-polly': {
    description: 'Australian fast-fashion brand offering trendy, affordable clothing and accessories. Known for going-out outfits, party dresses, and influencer collaborations. Australian, trendy, affordable, fast-fashion.',
    notes: 'Australian fast-fashion, trendy, affordable, going-out wear'
  },
  'razer': {
    description: 'Gaming hardware brand offering high-performance peripherals, laptops, and accessories. Known for gaming mice, keyboards, headsets, and Blade laptops. Gaming hardware, high-performance, professional-grade.',
    notes: 'Gaming hardware, high-performance, professional-grade, peripherals'
  },
  'ritual': {
    description: 'Vitamin brand offering traceable, essential vitamins with transparent sourcing. Known for Essential for Women, Essential for Men, and traceable ingredients. Traceable, essential vitamins, transparent sourcing.',
    notes: 'Vitamins, traceable, essential, transparent sourcing'
  },
  'tatcha-beauty': {
    description: 'Luxury Japanese-inspired skincare brand offering elegant, effective products. Known for The Water Cream, The Dewy Skin Cream, and Japanese beauty rituals. Luxury, Japanese-inspired, elegant, effective.',
    notes: 'Luxury skincare, Japanese-inspired, elegant, effective'
  },
  'logitech-g': {
    description: 'Gaming peripherals brand offering high-performance mice, keyboards, and headsets. Known for G Pro series, G502 mouse, and G915 keyboard. Gaming peripherals, high-performance, professional-grade.',
    notes: 'Gaming peripherals, high-performance, professional-grade'
  },
  'alo-yoga': {
    description: 'Activewear brand offering stylish, high-quality yoga and fitness apparel. Known for leggings, sports bras, and matching sets. Activewear, stylish, high-quality, yoga-focused.',
    notes: 'Activewear, stylish, high-quality, yoga-focused'
  },
  'beginning-boutique': {
    description: 'Australian fashion brand offering trendy, affordable clothing and accessories. Known for going-out outfits, party dresses, and influencer collaborations. Australian, trendy, affordable, fast-fashion.',
    notes: 'Australian fashion, trendy, affordable, going-out wear'
  },
  'nasty-gal': {
    description: 'UK-based fast-fashion brand offering trendy, edgy clothing and accessories. Known for going-out outfits, statement pieces, and bold designs. UK, trendy, edgy, fast-fashion.',
    notes: 'UK fast-fashion, trendy, edgy, going-out wear'
  },
  'allbirds': {
    description: 'Sustainable footwear brand offering comfortable, eco-friendly shoes made from natural materials. Known for Tree Runners, Wool Runners, and carbon-neutral shipping. Sustainable, comfortable, eco-friendly, natural materials.',
    notes: 'Sustainable footwear, comfortable, eco-friendly, natural materials'
  },
  'corsair': {
    description: 'Gaming hardware brand offering high-performance components, peripherals, and accessories. Known for gaming keyboards, mice, headsets, and PC components. Gaming hardware, high-performance, professional-grade.',
    notes: 'Gaming hardware, high-performance, professional-grade, components'
  },
  'gymshark': {
    description: 'Fitness apparel brand offering high-quality, performance-focused activewear. Known for leggings, sports bras, and influencer collaborations. Fitness apparel, high-quality, performance-focused, influencer brand.',
    notes: 'Fitness apparel, high-quality, performance-focused, influencer brand'
  },
  // Final batch
  'sakara': {
    description: 'Wellness brand offering organic, plant-based meal delivery and supplements. Known for Life Detox program, Super Powder, and organic nutrition. Wellness, organic, plant-based, meal delivery.',
    notes: 'Wellness, organic, plant-based, meal delivery'
  },
  'asos': {
    description: 'UK-based online fashion retailer offering trendy, affordable clothing and accessories. Known for wide selection, fast fashion, and inclusive sizing. UK, online retailer, trendy, affordable, inclusive.',
    notes: 'UK online retailer, trendy, affordable, inclusive sizing'
  },
  'reformation': {
    description: 'Sustainable fashion brand offering trendy, eco-friendly clothing and accessories. Known for dresses, sustainable practices, and transparent supply chain. Sustainable, trendy, eco-friendly, transparent.',
    notes: 'Sustainable fashion, trendy, eco-friendly, transparent'
  },
  'lululemon': {
    description: 'Athletic apparel brand offering high-quality, performance-focused activewear and accessories. Known for Align leggings, sports bras, and yoga-focused designs. Athletic apparel, high-quality, performance-focused, yoga.',
    notes: 'Athletic apparel, high-quality, performance-focused, yoga'
  },
  'revolve': {
    description: 'Online fashion retailer offering curated selection of trendy, contemporary brands. Known for designer and contemporary clothing, shoes, and accessories. Online retailer, curated, trendy, contemporary.',
    notes: 'Online retailer, curated, trendy, contemporary brands'
  },
  'laura-mercier---us': {
    description: 'Luxury beauty brand offering sophisticated, professional-grade makeup and skincare. Known for Translucent Loose Setting Powder, Tinted Moisturizer, and Flawless Face collection. Luxury, sophisticated, professional-grade.',
    notes: 'Luxury beauty, sophisticated, professional-grade, setting powder'
  },
  'prose': {
    description: 'Customizable hair care brand offering personalized formulas based on hair quiz. Known for custom shampoo, conditioner, and treatments tailored to individual needs. Customizable, personalized, made-to-order.',
    notes: 'Customizable hair care, personalized, made-to-order, hair quiz'
  },
  'sephora': {
    description: 'Beauty retailer offering curated selection of luxury and cult beauty brands. Known for exclusive products, beauty services, and wide brand selection. Beauty retailer, curated, luxury, exclusive products.',
    notes: 'Beauty retailer, curated, luxury, exclusive products'
  },
  'solid-striped': {
    description: 'Fashion brand offering elegant, everyday clothing and swimwear. Known for dresses, cozy knits, and timeless designs. Fashion, elegant, everyday, timeless designs.',
    notes: 'Fashion, elegant, everyday, timeless, swimwear'
  },
  'staud': {
    description: 'Contemporary fashion brand offering modern clothing, handbags, and accessories. Known for iconic handbags, modern designs, and everyday pieces with unique perspective. Contemporary, modern, handbags, unique perspective.',
    notes: 'Contemporary fashion, modern, handbags, unique perspective'
  },
  // Final remaining brands
  'patagonia': {
    description: 'Outdoor apparel brand offering sustainable, high-quality clothing and gear. Known for environmental activism, durable products, and Patagonia Provisions. Sustainable, outdoor, high-quality, environmental mission.',
    notes: 'Outdoor apparel, sustainable, high-quality, environmental activism'
  },
  'almay': {
    description: 'Hypoallergenic makeup brand offering gentle, dermatologist-tested cosmetics. Known for Smart Shade foundation, Intense i-Color palettes, and allergy-tested formulas. Hypoallergenic, gentle, dermatologist-tested, accessible.',
    notes: 'Hypoallergenic makeup, gentle, dermatologist-tested, accessible'
  },
  'baggu': {
    description: 'Sustainable accessories brand offering reusable bags, pouches, and accessories. Known for Standard Baggu, Duck Bag, and colorful designs. Sustainable, reusable, colorful, functional.',
    notes: 'Sustainable accessories, reusable bags, colorful, functional'
  },
  'by-far': {
    description: 'Contemporary accessories brand offering modern handbags, shoes, and accessories. Known for Rachel bag, Tanya sandals, and minimalist designs. Contemporary, modern, minimalist, trendy.',
    notes: 'Contemporary accessories, modern, minimalist, trendy'
  },
  'fashionnovacom': {
    description: 'US-based fast-fashion brand offering trendy, affordable clothing and accessories. Known for bodycon dresses, going-out outfits, and inclusive sizing. US, trendy, affordable, fast-fashion, inclusive.',
    notes: 'US fast-fashion, trendy, affordable, inclusive sizing'
  },
  'the-body-shop': {
    description: 'Ethical beauty brand offering natural, cruelty-free skincare, body care, and makeup. Known for Tea Tree line, Body Butter, and community trade ingredients. Ethical, natural, cruelty-free, community trade.',
    notes: 'Ethical beauty, natural, cruelty-free, community trade'
  },
  'wild-earth': {
    description: 'Vegan pet food brand offering plant-based, sustainable nutrition for dogs and cats. Known for high-protein formulas, sustainable ingredients, and Shark Tank appearance. Vegan, plant-based, sustainable, pet food.',
    notes: 'Vegan pet food, plant-based, sustainable, Shark Tank'
  },
  // Additional remaining brands
  'flower-beauty-by-drew': {
    description: 'Affordable makeup brand by Drew Barrymore offering quality cosmetics at drugstore prices. Known for foundation, lipsticks, and accessible luxury. Celebrity brand, affordable, drugstore, accessible luxury.',
    notes: 'Drew Barrymore brand, affordable, drugstore, accessible luxury'
  },
  'juvias-place': {
    description: 'Makeup brand offering high-pigment, inclusive cosmetics with wide shade ranges. Known for eyeshadow palettes, foundation, and bold colors. High-pigment, inclusive, wide shade range, bold colors.',
    notes: 'High-pigment makeup, inclusive, wide shade range, bold colors'
  },
  'maybelline-new-york': {
    description: 'Affordable makeup brand offering accessible, trend-driven cosmetics. Known for Great Lash Mascara, Fit Me Foundation, and SuperStay Lip Color. Affordable, accessible, trend-driven, wide range.',
    notes: 'Affordable makeup, accessible, trend-driven, wide range'
  },
  'pacifica-beauty': {
    description: 'Clean beauty brand offering vegan, cruelty-free skincare, makeup, and body care. Known for Glow Baby collection, Kale Detox line, and 100% vegan formulas. Clean, vegan, cruelty-free, accessible.',
    notes: 'Clean beauty, vegan, cruelty-free, accessible'
  },
  'poppi': {
    description: 'Prebiotic soda brand offering gut-healthy, low-sugar sparkling beverages. Known for prebiotic fiber, natural flavors, and functional benefits. Prebiotic, gut-healthy, low-sugar, functional beverages.',
    notes: 'Prebiotic soda, gut-healthy, low-sugar, functional'
  },
  'real-techniques': {
    description: 'Makeup brush brand offering professional-quality, affordable tools and accessories. Known for Expert Face Brush, Beauty Sponge, and professional-grade quality. Professional-quality, affordable, makeup tools.',
    notes: 'Makeup brushes, professional-quality, affordable, tools'
  }
};

async function enrichBrands() {
  console.log('🚀 Starting brand enrichment process...\n');
  
  // Fetch all brands
  const brands = await fetchAllBrands();
  console.log(`✅ Fetched ${brands.length} brands\n`);

  // Find brands that need enrichment
  const brandsToEnrich = brands.filter(brand => 
    BRAND_ENRICHMENTS[brand.slug]
  );

  console.log(`📝 Found ${brandsToEnrich.length} brands ready for enrichment\n`);
  console.log('='.repeat(60));

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process each brand
  for (const brand of brandsToEnrich) {
    const enrichment = BRAND_ENRICHMENTS[brand.slug];
    
    console.log(`\n📌 Updating: ${brand.name} (${brand.slug})`);
    console.log(`   Current: "${brand.description?.substring(0, 80)}${brand.description?.length > 80 ? '...' : ''}"`);
    console.log(`   New: "${enrichment.description.substring(0, 80)}${enrichment.description.length > 80 ? '...' : ''}"`);
    
    const result = await updateBrandDescription(brand.id, enrichment.description);
    
    if (result.success) {
      console.log(`   ✅ Success`);
      successCount++;
    } else {
      console.log(`   ❌ Error: ${result.error}`);
      errorCount++;
      errors.push({ brand: brand.name, slug: brand.slug, error: result.error });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ brand, slug, error }) => {
      console.log(`   - ${brand} (${slug}): ${error}`);
    });
  }

  console.log('\n✅ Enrichment process complete!');
}

if (require.main === module) {
  enrichBrands().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
} else {
  module.exports = { enrichBrands, BRAND_ENRICHMENTS };
}
