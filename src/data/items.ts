export interface BodyItem {
  id: string
  name: string
  tierIndex: number
  glyph: string
  fact: string
}

export interface Tier {
  index: number
  name: string
  color: number
}

export const TIERS: Tier[] = [
  { index: 0, name: 'Subatomic Particle', color: 0x8e44ad },
  { index: 1, name: 'Atom', color: 0x2980b9 },
  { index: 2, name: 'Small Molecule', color: 0x16a085 },
  { index: 3, name: 'Macromolecule', color: 0x27ae60 },
  { index: 4, name: 'Small Organelle', color: 0xf39c12 },
  { index: 5, name: 'Large Organelle', color: 0xd35400 },
  { index: 6, name: 'Basic Cell', color: 0xc0392b },
  { index: 7, name: 'Specialized Cell', color: 0xe74c3c },
  { index: 8, name: 'Tissue', color: 0x2c3e50 },
  { index: 9, name: 'Small Organ', color: 0x7f8c8d },
  { index: 10, name: 'Large Organ', color: 0xe84393 },
]

export const ITEMS: BodyItem[] = [
  // Tier 0: Subatomic Particle
  { id: 'quark', name: 'Quark', tierIndex: 0, glyph: '✨', fact: 'Quarks are among the smallest known particles — they combine in threes to build the protons and neutrons in every atom of your body.' },
  { id: 'electron', name: 'Electron', tierIndex: 0, glyph: '⚡', fact: 'Electrons are tiny, negatively-charged particles that orbit atomic nuclei and carry the electrical signals in your nerves.' },
  { id: 'proton', name: 'Proton', tierIndex: 0, glyph: '➕', fact: "Protons are positively-charged particles in an atom's nucleus — the number of protons determines what element it is." },
  { id: 'neutron', name: 'Neutron', tierIndex: 0, glyph: '⚪', fact: 'Neutrons sit in the nucleus alongside protons, adding mass without adding charge.' },
  { id: 'sodium-ion', name: 'Sodium Ion', tierIndex: 0, glyph: '🧂', fact: 'Sodium ions rush in and out of your nerve cells to create the electrical signals behind every thought and movement.' },
  // Tier 1: Atom
  { id: 'hydrogen', name: 'Hydrogen', tierIndex: 1, glyph: 'H', fact: 'Hydrogen is the lightest and most abundant atom in your body, found mostly in water and fat.' },
  { id: 'carbon', name: 'Carbon', tierIndex: 1, glyph: 'C', fact: 'Carbon is the backbone of every organic molecule in your body — from DNA to muscle to fat.' },
  { id: 'oxygen-atom', name: 'Oxygen', tierIndex: 1, glyph: 'O', fact: "Oxygen makes up about 65% of your body's mass, mostly locked inside water molecules." },
  { id: 'nitrogen', name: 'Nitrogen', tierIndex: 1, glyph: 'N', fact: "Nitrogen is essential to proteins and DNA — your genes couldn't exist without it." },
  { id: 'calcium', name: 'Calcium', tierIndex: 1, glyph: 'Ca', fact: 'Calcium builds your bones and teeth, and also helps your muscles contract.' },
  // Tier 2: Small Molecule
  { id: 'water', name: 'Water', tierIndex: 2, glyph: '💧', fact: 'Water (H2O) makes up around 60% of your entire body.' },
  { id: 'oxygen-molecule', name: 'Oxygen (O₂)', tierIndex: 2, glyph: '🫧', fact: 'The oxygen molecule you breathe in travels through your blood to fuel every cell.' },
  { id: 'carbon-dioxide', name: 'Carbon Dioxide (CO₂)', tierIndex: 2, glyph: '☁️', fact: 'Carbon dioxide is the waste gas your cells produce, which you breathe back out.' },
  { id: 'glucose', name: 'Glucose', tierIndex: 2, glyph: '🍬', fact: 'Glucose is the simple sugar your cells burn for energy.' },
  { id: 'amino-acid', name: 'Amino Acid', tierIndex: 2, glyph: '🔗', fact: 'Amino acids are the building blocks that link together to form proteins.' },
  // Tier 3: Macromolecule
  { id: 'dna', name: 'DNA', tierIndex: 3, glyph: '🧬', fact: 'DNA carries the genetic instructions for every cell in your body.' },
  { id: 'protein', name: 'Protein (Collagen)', tierIndex: 3, glyph: '🧵', fact: 'Collagen is the most abundant protein in your body, giving structure to skin, bone, and tendons.' },
  { id: 'lipid', name: 'Lipid (Fat)', tierIndex: 3, glyph: '🫙', fact: 'Fat molecules store energy and form the protective membrane around every cell.' },
  { id: 'glycogen', name: 'Glycogen', tierIndex: 3, glyph: '🍯', fact: 'Glycogen is how your body stores extra glucose in your liver and muscles for later use.' },
  { id: 'hemoglobin', name: 'Hemoglobin', tierIndex: 3, glyph: '🩸', fact: 'Hemoglobin is the protein in red blood cells that grabs onto oxygen and carries it through your bloodstream.' },
  // Tier 4: Small Organelle
  { id: 'ribosome', name: 'Ribosome', tierIndex: 4, glyph: '⚙️', fact: 'Ribosomes are tiny factories inside cells that build proteins from amino acids.' },
  { id: 'lysosome', name: 'Lysosome', tierIndex: 4, glyph: '♻️', fact: "Lysosomes are the cell's recycling centers, breaking down waste and worn-out parts." },
  { id: 'vesicle', name: 'Vesicle', tierIndex: 4, glyph: '🔵', fact: 'Vesicles are tiny bubbles that transport materials around inside a cell.' },
  { id: 'peroxisome', name: 'Peroxisome', tierIndex: 4, glyph: '🧪', fact: 'Peroxisomes break down toxic substances and fatty acids inside your cells.' },
  { id: 'centriole', name: 'Centriole', tierIndex: 4, glyph: '❌', fact: "Centrioles help organize a cell's internal skeleton and guide it when it divides." },
  // Tier 5: Large Organelle
  { id: 'mitochondrion', name: 'Mitochondrion', tierIndex: 5, glyph: '🔋', fact: 'Mitochondria are the "powerhouse of the cell," converting nutrients into usable energy.' },
  { id: 'nucleus', name: 'Nucleus', tierIndex: 5, glyph: '🎯', fact: "The nucleus stores a cell's DNA and controls nearly everything the cell does." },
  { id: 'golgi', name: 'Golgi Apparatus', tierIndex: 5, glyph: '📦', fact: "The Golgi apparatus packages and ships proteins to where they're needed in the cell." },
  { id: 'endoplasmic-reticulum', name: 'Endoplasmic Reticulum', tierIndex: 5, glyph: '🕸️', fact: 'The endoplasmic reticulum builds proteins and fats and folds them into shape.' },
  { id: 'vacuole', name: 'Vacuole', tierIndex: 5, glyph: '🎈', fact: 'Vacuoles store water, nutrients, and waste inside a cell.' },
  // Tier 6: Basic Cell
  { id: 'red-blood-cell', name: 'Red Blood Cell', tierIndex: 6, glyph: '🔴', fact: 'Red blood cells carry oxygen throughout your body — you have about 25 trillion of them.' },
  { id: 'white-blood-cell', name: 'White Blood Cell', tierIndex: 6, glyph: '⚪', fact: "White blood cells are your immune system's soldiers, fighting off infection." },
  { id: 'platelet', name: 'Platelet', tierIndex: 6, glyph: '🩹', fact: 'Platelets rush to injuries and clump together to stop bleeding.' },
  { id: 'bacterium', name: 'Bacterium', tierIndex: 6, glyph: '🦠', fact: "Trillions of bacteria live in your gut, helping digest food and support your immune system." },
  { id: 'skin-cell', name: 'Skin Cell', tierIndex: 6, glyph: '🟤', fact: 'Your body sheds and replaces about 30,000 to 40,000 skin cells every minute.' },
  // Tier 7: Specialized Cell
  { id: 'neuron', name: 'Neuron', tierIndex: 7, glyph: '🔌', fact: 'Neurons are nerve cells that send electrical signals — your brain has about 86 billion of them.' },
  { id: 'muscle-fiber', name: 'Muscle Fiber Cell', tierIndex: 7, glyph: '💪', fact: 'Muscle fiber cells can be several inches long and contract to move your whole body.' },
  { id: 'egg-cell', name: 'Egg Cell', tierIndex: 7, glyph: '🥚', fact: 'The egg cell is the largest single cell in the human body — big enough to just barely see with the naked eye.' },
  { id: 'sperm-cell', name: 'Sperm Cell', tierIndex: 7, glyph: '🎾', fact: 'Sperm cells are among the smallest human cells, built almost entirely to swim and deliver DNA.' },
  { id: 'fat-cell', name: 'Fat Cell', tierIndex: 7, glyph: '🟡', fact: 'Fat cells store energy as lipids and can expand to many times their original size.' },
  // Tier 8: Tissue
  { id: 'muscle-tissue', name: 'Muscle Tissue', tierIndex: 8, glyph: '🥩', fact: 'Muscle tissue contracts to move your body and pump your heart.' },
  { id: 'epithelial-tissue', name: 'Epithelial Tissue', tierIndex: 8, glyph: '🧱', fact: "Epithelial tissue lines your skin, organs, and blood vessels, protecting what's underneath." },
  { id: 'nerve-tissue', name: 'Nerve Tissue', tierIndex: 8, glyph: '⚡', fact: 'Nerve tissue transmits electrical signals between your brain and the rest of your body.' },
  { id: 'connective-tissue', name: 'Connective Tissue', tierIndex: 8, glyph: '🪢', fact: "Connective tissue — like tendons and cartilage — holds your body's structures together." },
  { id: 'bone-tissue', name: 'Bone Tissue', tierIndex: 8, glyph: '🦴', fact: 'Bone tissue is a living, constantly-rebuilding material that supports and protects your body.' },
  // Tier 9: Small Organ
  { id: 'appendix', name: 'Appendix', tierIndex: 9, glyph: '🫘', fact: 'The appendix is a small pouch attached to the large intestine that may help maintain healthy gut bacteria.' },
  { id: 'pancreas', name: 'Pancreas', tierIndex: 9, glyph: '🫓', fact: 'The pancreas produces insulin, which controls your blood sugar levels.' },
  { id: 'thyroid', name: 'Thyroid', tierIndex: 9, glyph: '🦋', fact: 'The thyroid, in your neck, produces hormones that regulate your metabolism.' },
  { id: 'gallbladder', name: 'Gallbladder', tierIndex: 9, glyph: '🍐', fact: 'The gallbladder stores bile, which helps you digest fat.' },
  { id: 'eye', name: 'Eye', tierIndex: 9, glyph: '👁️', fact: 'The eye can distinguish about 10 million different colors.' },
  // Tier 10: Large Organ
  { id: 'heart', name: 'Heart', tierIndex: 10, glyph: '❤️', fact: 'Your heart beats about 100,000 times a day, pumping blood through your entire body.' },
  { id: 'lungs', name: 'Lungs', tierIndex: 10, glyph: '🫁', fact: 'Your lungs have a surface area roughly the size of a tennis court for exchanging oxygen and carbon dioxide.' },
  { id: 'liver', name: 'Liver', tierIndex: 10, glyph: '🟫', fact: 'The liver is the largest internal organ, filtering toxins and helping digest food.' },
  { id: 'brain', name: 'Brain', tierIndex: 10, glyph: '🧠', fact: "Your brain uses about 20% of your body's total energy, despite being only 2% of its weight." },
  { id: 'skin', name: 'Skin', tierIndex: 10, glyph: '🫳', fact: 'Skin is the largest organ in the human body overall, covering about 2 square meters.' },
]
