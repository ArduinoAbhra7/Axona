export interface Topic {
  id: string;
  name: string;
  subtopics: string[];
}

export interface SubjectSyllabus {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: Topic[];
}

export interface ClassSyllabus {
  classNumber: number;
  label: string;
  subjects: SubjectSyllabus[];
}

// ═════════════════════════════════════════════════════════════════════════════
//  JEE SYLLABUS DATA (Class 11 & 12)
// ═════════════════════════════════════════════════════════════════════════════
const JEE_SYLLABUS: Record<number, SubjectSyllabus[]> = {
  11: [
    {
      id: 'jee-math-11',
      name: 'Mathematics',
      icon: 'math',
      color: '#2dd4bf',
      topics: [
        { id: 'jm11-1', name: 'Sets, Relations and Functions', subtopics: ['Sets and Representing Sets', 'Types of Sets & Venn Diagrams', 'Cartesian Product & Relations', 'Types of Functions & Graphs'] },
        { id: 'jm11-2', name: 'Complex Numbers & Quadratic Equations', subtopics: ['Complex Numbers Algebra', 'Modulus and Argument & Polar Form', 'Quadratic Equations Roots', 'Roots of Unity'] },
        { id: 'jm11-3', name: 'Matrices and Determinants', subtopics: ['Types of Matrices', 'Determinant Properties', 'Adjoint & Inverse', 'Cramers Rule & Linear Equations'] },
        { id: 'jm11-4', name: 'Permutations & Combinations', subtopics: ['Fundamental Counting Principle', 'Permutations Formula', 'Combinations Formula', 'Circular Permutations'] },
        { id: 'jm11-5', name: 'Binomial Theorem', subtopics: ['Binomial Expansion Properties', 'General and Middle Terms', 'Binomial Coefficients Properties'] },
        { id: 'jm11-6', name: 'Sequences and Series', subtopics: ['Arithmetic Progression AP', 'Geometric Progression GP', 'Harmonic Progression HP', 'AGP and Special Series'] },
        { id: 'jm11-7', name: 'Trigonometry', subtopics: ['Trigonometric Ratios & Identities', 'Trigonometric Equations', 'Heights and Distances'] },
        { id: 'jm11-8', name: 'Coordinate Geometry - 2D', subtopics: ['Straight Lines Equations', 'Distance & Section Formulas', 'Pair of Straight Lines'] },
      ]
    },
    {
      id: 'jee-phys-11',
      name: 'Physics',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'jp11-1', name: 'Units & Measurements', subtopics: ['SI Units & Dimensions', 'Errors in Measurement', 'Significant Figures & Vernier Calipers'] },
        { id: 'jp11-2', name: 'Kinematics', subtopics: ['Motion in Straight Line', 'Projectile Motion', 'Relative Motion in 2D', 'Equations of Motion'] },
        { id: 'jp11-3', name: 'Laws of Motion', subtopics: ['Newton Laws of Motion', 'Friction & Circular Motion', 'Banking of Roads'] },
        { id: 'jp11-4', name: 'Work, Energy & Power', subtopics: ['Work Done by Forces', 'Kinetic & Potential Energy', 'Conservation of Energy', 'Collisions in 1D and 2D'] },
        { id: 'jp11-5', name: 'Rotational Motion', subtopics: ['Center of Mass & Linear Momentum', 'Torque & Angular Momentum', 'Moment of Inertia Theorems', 'Rolling Motion Dynamics'] },
        { id: 'jp11-6', name: 'Gravitation', subtopics: ['Kepler Laws of Planetary Motion', 'Gravitational Field and Potential', 'Escape Velocity', 'Satellite Orbital Velocity'] },
        { id: 'jp11-7', name: 'Thermodynamics', subtopics: ['Thermal Expansion & Calorimetry', 'First Law of Thermodynamics', 'Second Law & Carnot Engine', 'Kinetic Theory of Gases'] },
        { id: 'jp11-8', name: 'Waves & Oscillations', subtopics: ['Simple Harmonic Motion SHM', 'Damped & Forced Oscillations', 'Wave Speed & Standing Waves', 'Beats & Doppler Effect'] }
      ]
    },
    {
      id: 'jee-chem-11',
      name: 'Chemistry',
      icon: 'chemistry',
      color: '#10b981',
      topics: [
        { id: 'jc11-1', name: 'Basic Concepts of Chemistry', subtopics: ['Mole Concept & Stoichiometry', 'Empirical & Molecular Formulas', 'Limiting Reagent & Concentration Terms'] },
        { id: 'jc11-2', name: 'Atomic Structure', subtopics: ['Bohr Model of Hydrogen Atom', 'Quantum Numbers & Heisenberg Principle', 'Aufbau & Hunds Rules'] },
        { id: 'jc11-3', name: 'Chemical Bonding', subtopics: ['Ionic & Covalent Bonds', 'VSEPR Theory & Geometries', 'Hybridisation & Dipole Moment', 'Molecular Orbital Theory MOT'] },
        { id: 'jc11-4', name: 'Thermodynamics', subtopics: ['First Law & Enthalpy Changes', 'Hess Law & Bond Energies', 'Entropy & Gibbs Free Energy'] },
        { id: 'jc11-5', name: 'Chemical & Ionic Equilibrium', subtopics: ['Le Chateliers Principle', 'Solubility Product Ksp', 'pH Scale & Buffer Solutions'] },
        { id: 'jc11-6', name: 'Organic Chemistry Basics', subtopics: ['IUPAC Nomenclature of Organics', 'Inductive & Resonance Effects', 'Hyperconjugation & Electrophiles', 'Isomerism - Structural & Stereo'] }
      ]
    }
  ],
  12: [
    {
      id: 'jee-math-12',
      name: 'Mathematics',
      icon: 'math',
      color: '#2dd4bf',
      topics: [
        { id: 'jm12-1', name: 'Relations and Functions', subtopics: ['Types of Relations', 'One-One and Onto Functions', 'Composition & Inverse Functions'] },
        { id: 'jm12-2', name: 'Inverse Trigonometric Functions', subtopics: ['Principal Value Branches', 'Inverse Trigonometric Properties'] },
        { id: 'jm12-3', name: 'Limits, Continuity & Differentiability', subtopics: ['Continuity of Functions', 'Differentiability & Chain Rule', 'Logarithmic & Parametric Differentiation', 'Mean Value Theorems'] },
        { id: 'jm12-4', name: 'Applications of Derivatives', subtopics: ['Tangents and Normals', 'Increasing & Decreasing Functions', 'Maxima and Minima Optimization'] },
        { id: 'jm12-5', name: 'Integrals', subtopics: ['Indefinite Integration Methods', 'Definite Integrals Properties', 'Area Under Curves'] },
        { id: 'jm12-6', name: 'Differential Equations', subtopics: ['Order and Degree', 'Variable Separable Method', 'Linear Differential Equations'] },
        { id: 'jm12-7', name: 'Vector Algebra & 3D Geometry', subtopics: ['Dot & Cross Products', 'Scalar Triple Product', 'Equations of Lines in 3D', 'Planes in 3D Space'] },
        { id: 'jm12-8', name: 'Probability', subtopics: ['Conditional Probability', 'Bayes Theorem', 'Random Variables & Binomial'] }
      ]
    },
    {
      id: 'jee-phys-12',
      name: 'Physics',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'jp12-1', name: 'Electrostatics', subtopics: ['Coulombs Law & Fields', 'Gauss Law Applications', 'Electric Potential & Capacitors', 'Dielectrics & Energy Stored'] },
        { id: 'jp12-2', name: 'Current Electricity', subtopics: ['Drift Velocity & Ohms Law', 'Kirchhoff Laws & Circuits', 'Wheatstone Bridge & Potentiometer'] },
        { id: 'jp12-3', name: 'Magnetism', subtopics: ['Biot Savart & Ampere Laws', 'Lorentz Force & Cyclotron', 'Moving Coil Galvanometer', 'Magnetic Field of Earth'] },
        { id: 'jp12-4', name: 'EMI & Alternating Currents', subtopics: ['Faradays & Lenz Laws', 'Self & Mutual Inductance', 'LCR AC Circuits & Resonance', 'Transformers & Generator'] },
        { id: 'jp12-5', name: 'Optics', subtopics: ['Reflection & Refraction at Spherical Surfaces', 'Lenses & Optical Instruments', 'Interference & Youngs Double Slit YDSE', 'Diffraction & Polarisation'] },
        { id: 'jp12-6', name: 'Modern Physics', subtopics: ['Photoelectric Effect Einstein Equation', 'De Broglie Waves', 'Bohr Atom Model & Hydrogen Spectrum', 'Radioactivity & Nuclear Binding Energy'] },
        { id: 'jp12-7', name: 'Semiconductors', subtopics: ['Intrinsic & Extrinsic Semiconductors', 'p-n Junction Diode & Rectifier', 'Zener Diode & Logic Gates'] }
      ]
    },
    {
      id: 'jee-chem-12',
      name: 'Chemistry',
      icon: 'chemistry',
      color: '#10b981',
      topics: [
        { id: 'jc12-1', name: 'Solutions', subtopics: ['Raoults Law & Ideal Solutions', 'Colligative Properties & Elevation in BP', 'Depression in FP & Osmotic Pressure', 'Vant Hoff Factor'] },
        { id: 'jc12-2', name: 'Electrochemistry', subtopics: ['Nernst Equation & Cell Potential', 'Kohlrausch Law & Conductance', 'Faraday Laws of Electrolysis', 'Batteries & Fuel Cells'] },
        { id: 'jc12-3', name: 'Chemical Kinetics', subtopics: ['Rate of Reaction & Order', 'First Order Reactions & Half Life', 'Arrhenius Equation & Activation Energy'] },
        { id: 'jc12-4', name: 'd- and f-Block & Coordination', subtopics: ['Transition Elements Properties', 'Coordination Complexes Nomenclature', 'Isomerism in Coordination', 'Crystal Field Theory CFT'] },
        { id: 'jc12-5', name: 'Organic Chemistry Reactions', subtopics: ['Nucleophilic Substitution SN1 & SN2', 'Electrophilic Aromatic Substitution', 'Aldol & Cannizzaro Reactions', 'Hoffmann & Diazotisation Reactions'] },
        { id: 'jc12-6', name: 'Biomolecules & Everyday Chemistry', subtopics: ['Carbohydrates & Glucose Structure', 'Proteins & Amino Acids', 'Nucleic Acids DNA & RNA', 'Polymers Classification'] }
      ]
    }
  ]
};

// ═════════════════════════════════════════════════════════════════════════════
//  NEET SYLLABUS DATA (Class 11 & 12)
// ═════════════════════════════════════════════════════════════════════════════
const NEET_SYLLABUS: Record<number, SubjectSyllabus[]> = {
  11: [
    {
      id: 'neet-bio-11',
      name: 'Biology',
      icon: 'biology',
      color: '#22c55e',
      topics: [
        { id: 'nb11-1', name: 'Diversity in Living World', subtopics: ['What is Living & Taxonomy', 'Five Kingdom Classification', 'Plant Kingdom & Animal Kingdom'] },
        { id: 'nb11-2', name: 'Structural Organisation', subtopics: ['Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Animal Tissues & Cockroach/Frog'] },
        { id: 'nb11-3', name: 'Cell Structure & Function', subtopics: ['Cell Membrane & Cell Wall', 'Cell Organelles & Nucleus', 'Cell Cycle & Mitosis/Meiosis', 'Biomolecules Lipids & Proteins'] },
        { id: 'nb11-4', name: 'Plant Physiology', subtopics: ['Photosynthesis in Higher Plants', 'Respiration in Plants & Glycolysis', 'Plant Growth & Hormones Auxin'] },
        { id: 'nb11-5', name: 'Human Physiology', subtopics: ['Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products and Elimination', 'Locomotion and Movement', 'Neural Control & Coordination', 'Chemical Coordination & Endocrine'] }
      ]
    },
    {
      id: 'neet-phys-11',
      name: 'Physics',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'np11-1', name: 'Physical World & Measurement', subtopics: ['Dimensional Formula & SI Units', 'Significant Figures & Errors'] },
        { id: 'np11-2', name: 'Kinematics', subtopics: ['Motion in Straight Line', 'Projectile Motion & Relative Motion'] },
        { id: 'np11-3', name: 'Laws of Motion & Friction', subtopics: ['Newton Laws of Motion', 'Friction & Circular Motion'] },
        { id: 'np11-4', name: 'Work, Energy & Power', subtopics: ['Work Done & Kinetic/Potential Energy', 'Conservation of Energy & Collisions'] },
        { id: 'np11-5', name: 'System of Particles & Rotational', subtopics: ['Center of Mass & Torque', 'Moment of Inertia Theorems'] },
        { id: 'np11-6', name: 'Gravitation', subtopics: ['Universal Gravitation Law', 'Kepler Laws & Satellite Motion'] },
        { id: 'np11-7', name: 'Properties of Bulk Matter', subtopics: ['Elasticity Hookes Law', 'Viscosity & Surface Tension', 'Bernoullis Principle'] },
        { id: 'np11-8', name: 'Thermodynamics & Waves', subtopics: ['Calorimetry & Laws of Thermodynamics', 'Kinetic Theory of Gases', 'SHM & Oscillations', 'Standing Waves & Doppler Effect'] }
      ]
    },
    {
      id: 'neet-chem-11',
      name: 'Chemistry',
      icon: 'chemistry',
      color: '#10b981',
      topics: [
        { id: 'nc11-1', name: 'Some Basic Concepts of Chemistry', subtopics: ['Laws of Chemical Combinations', 'Mole Concept & Stoichiometry', 'Concentration Terms Molarity'] },
        { id: 'nc11-2', name: 'Atomic Structure & Classification', subtopics: ['Bohr Hydrogen Atom', 'Quantum Numbers Rules', 'Periodic Trends Electronegativity'] },
        { id: 'nc11-3', name: 'Chemical Bonding & States', subtopics: ['VSEPR Theory shapes', 'Hybridisation Sp/Sp2/Sp3', 'Dipole Moments & Hydrogen Bond'] },
        { id: 'nc11-4', name: 'Chemical Thermodynamics & Eq', subtopics: ['Enthalpy & Entropy Change', 'Le Chateliers Principle', 'Solubility Product Ksp & pH'] },
        { id: 'nc11-5', name: 'Redox Reactions & Hydrogen', subtopics: ['Oxidation State Balance', 'Redox Titration & Hydrogen Properties'] },
        { id: 'nc11-6', name: 'Organic Chemistry Principles', subtopics: ['IUPAC Nomenclature', 'Inductive & Resonance Effects', 'Electrophilic & Nucleophilic reactions', 'Hydrocarbons Alkanes & Alkenes'] }
      ]
    }
  ],
  12: [
    {
      id: 'neet-bio-12',
      name: 'Biology',
      icon: 'biology',
      color: '#22c55e',
      topics: [
        { id: 'nb12-1', name: 'Reproduction', subtopics: ['Sexual Reproduction in Flowering Plants', 'Human Reproductive System', 'Pregnancy & Reproductive Health'] },
        { id: 'nb12-2', name: 'Genetics and Evolution', subtopics: ['Mendelian Inheritance & Deviations', 'Structure of DNA & Replication', 'Transcription & Translation & Genetic Code', 'Origin of Life & Darwinian Evolution'] },
        { id: 'nb12-3', name: 'Biology in Human Welfare', subtopics: ['Human Health & Common Diseases', 'Immunity Types & Cancer', 'Microbes in Sewage Treatment & Biocontrol'] },
        { id: 'nb12-4', name: 'Biotechnology', subtopics: ['Restriction Enzymes & Cloning Vectors', 'PCR & Recombinant DNA', 'Bt Cotton & Insulins & Gene Therapy'] },
        { id: 'nb12-5', name: 'Ecology and Environment', subtopics: ['Organisms and Populations Adaptation', 'Ecosystem Cycles & Energy Flow', 'Biodiversity Hotspots & Conservation'] }
      ]
    },
    {
      id: 'neet-phys-12',
      name: 'Physics',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'np12-1', name: 'Electrostatics & Current', subtopics: ['Coulombs Law & Gauss Law', 'Capacitance & Energy Stored', 'Drift Velocity & Kirchhoff Laws', 'Wheatstone Bridge & Potentiometer'] },
        { id: 'np12-2', name: 'Magnetic Effects & EMI', subtopics: ['Biot Savart Law & Ampere Law', 'Self & Mutual Induction', 'LCR AC Circuits & Resonance'] },
        { id: 'np12-3', name: 'Optics', subtopics: ['Refraction at Lenses & Prism', 'Microscopes & Telescopes', 'Interference YDSE & Diffraction'] },
        { id: 'np12-4', name: 'Modern Physics & Devices', subtopics: ['Photoelectric Effect Einstein', 'De Broglie Wavelength', 'Bohr Atom Model & Hydrogen Spectrum', 'PN Junction Diode & Rectifiers & Gates'] }
      ]
    },
    {
      id: 'neet-chem-12',
      name: 'Chemistry',
      icon: 'chemistry',
      color: '#10b981',
      topics: [
        { id: 'nc12-1', name: 'Solutions & Electrochemistry', subtopics: ['Raoults Law & Colligative Properties', 'Nernst Equation & Cell Potential', 'Faradays Laws & Conductivity'] },
        { id: 'nc12-2', name: 'Chemical Kinetics', subtopics: ['First Order Rate Law & Half Life', 'Activation Energy & Arrhenius'] },
        { id: 'nc12-3', name: 'd/f Block & Coordination', subtopics: ['Transition Metals oxidation states', 'Coordination Complexes Ligands', 'Crystal Field Splitting CFT'] },
        { id: 'nc12-4', name: 'Haloalkanes & Alcohols', subtopics: ['SN1 & SN2 Mechanisms', 'E1 & E2 Elimination', 'Phenol Acidity & Lucas Test'] },
        { id: 'nc12-5', name: 'Aldehydes, Ketones & Amines', subtopics: ['Aldol & Cannizzaro Condensations', 'Gabriel Phthalimide Synthesis', 'Basicity of Amines & Diazonium'] },
        { id: 'nc12-6', name: 'Biomolecules & Polymers', subtopics: ['Glucose Structure & Peptide Bonds', 'DNA Double Helix & RNA', 'Polymers Addition & Condensation'] }
      ]
    }
  ]
};

// ═════════════════════════════════════════════════════════════════════════════
//  WBBSE SYLLABUS DATA (Class 9 & 10 Madhyamik)
// ═════════════════════════════════════════════════════════════════════════════
const WBBSE_SYLLABUS: Record<number, SubjectSyllabus[]> = {
  9: [
    {
      id: 'wbbse-math-9',
      name: 'Mathematics',
      icon: 'math',
      color: '#2dd4bf',
      topics: [
        { id: 'wm9-1', name: 'Real Numbers & Laws of Indices', subtopics: ['Rational & Irrational Numbers', 'Laws of Indices & Surds'] },
        { id: 'wm9-2', name: 'Graph & Coordinate Geometry', subtopics: ['Cartesian Coordinates', 'Equation of Straight Line Graph'] },
        { id: 'wm9-3', name: 'Linear Simultaneous Equations', subtopics: ['Method of Substitution', 'Method of Elimination', 'Method of Cross Multiplication'] },
        { id: 'wm9-4', name: 'Properties of Parallelogram', subtopics: ['Theorems on Parallelogram Properties', 'Parallelogram Area Problems'] },
        { id: 'wm9-5', name: 'Polynomials & Factorisation', subtopics: ['Degree of Polynomials', 'Remainder Theorem', 'Factorisation Algebraic Identities'] },
        { id: 'wm9-6', name: 'Logarithm', subtopics: ['Logarithm Formulas', 'Logarithm Calculations'] }
      ]
    },
    {
      id: 'wbbse-phys-9',
      name: 'Physical Science',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'wp9-1', name: 'Measurement', subtopics: ['Physical Quantities & Units', 'Measuring Instruments Balance'] },
        { id: 'wp9-2', name: 'Force & Motion', subtopics: ['Rest and Motion Speed', 'Newton Laws of Motion', 'Momentum & Conservation of Momentum'] },
        { id: 'wp9-3', name: 'Atomic Structure', subtopics: ['Rutherford Model & Bohr Model', 'Isotopes Isobars & Isotones', 'Electronic Configuration'] },
        { id: 'wp9-4', name: 'Matter: Structure & Properties', subtopics: ['Elasticity & Viscosity', 'Surface Tension & Pressure of Liquids', 'Archimedes Principle & Floatation'] },
        { id: 'wp9-5', name: 'Acids, Bases & Salts', subtopics: ['pH Scale Indicators', 'Reactions of Acids and Bases', 'Preparation of Common Salts'] }
      ]
    },
    {
      id: 'wbbse-life-9',
      name: 'Life Science',
      icon: 'biology',
      color: '#22c55e',
      topics: [
        { id: 'wl9-1', name: 'Life & its Diversity', subtopics: ['Taxonomy and Systematics', 'Five Kingdom Classification', 'Plant Kingdom & Animal Kingdom Division'] },
        { id: 'wl9-2', name: 'Levels of Organisation of Life', subtopics: ['Structure of Plant Cell', 'Structure of Animal Cell', 'Organelles Mitochondria & Plastids', 'Plant Tissues Meristematic', 'Animal Tissues Epithelial & Nervous'] },
        { id: 'wl9-3', name: 'Physiological Processes of Life', subtopics: ['Photosynthesis Light/Dark Reactions', 'Respiration Aerobic/Anaerobic', 'Excretion in Plants and Animals', 'Circulation & Human Heart'] }
      ]
    }
  ],
  10: [
    {
      id: 'wbbse-math-10',
      name: 'Mathematics',
      icon: 'math',
      color: '#2dd4bf',
      topics: [
        { id: 'wm10-1', name: 'Quadratic Equation in One Variable', subtopics: ['Formulation of Quadratic Equation', 'Sridhar Acharya Formula', 'Nature of Roots'] },
        { id: 'wm10-2', name: 'Simple & Compound Interest', subtopics: ['Simple Interest Formula', 'Compound Interest Uniform Rate'] },
        { id: 'wm10-3', name: 'Ratio & Proportion', subtopics: ['Ratio properties', 'Proportion K-Method'] },
        { id: 'wm10-4', name: 'Partnership Business', subtopics: ['Profit Sharing Ratio', 'Capital Allocation Business'] },
        { id: 'wm10-5', name: 'Theorems on Circles & Tangents', subtopics: ['Angles in a Circle Theorems', 'Cyclic Quadrilateral Theorems', 'Tangent to a Circle Theorems'] },
        { id: 'wm10-6', name: 'Mensuration (Solid Objects)', subtopics: ['Right Circular Cylinder Area/Vol', 'Sphere Surface Area/Vol', 'Right Circular Cone Area/Vol'] },
        { id: 'wm10-7', name: 'Trigonometry', subtopics: ['Concept of Angle Measurement', 'Trigonometric Ratios & Identities', 'Trigonometric Complementary Angles', 'Heights and Distances'] },
        { id: 'wm10-8', name: 'Statistics', subtopics: ['Mean Calculation Grouped', 'Median & Mode', 'Ogive Graphic Representation'] }
      ]
    },
    {
      id: 'wbbse-phys-10',
      name: 'Physical Science',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'wp10-1', name: 'Environment & Gas Behaviour', subtopics: ['Ozone Layer & Greenhouse Gases', 'Boyles Law & Charles Law', 'Ideal Gas Equation PV=nRT'] },
        { id: 'wp10-2', name: 'Chemical Calculations', subtopics: ['Conservation of Mass in Reactions', 'Weight-Weight Calculations'] },
        { id: 'wp10-3', name: 'Thermal & Light Phenomena', subtopics: ['Thermal Conductivity & Expansion', 'Refraction at Spherical Surfaces', 'Lenses & Image Formation', 'Dispersion of Light & Spectrum'] },
        { id: 'wp10-4', name: 'Current Electricity', subtopics: ['Ohms Law & Resistance Factors', 'Joule Law of Heating', 'Electric Power & Household Wiring'] },
        { id: 'wp10-5', name: 'Atomic Nucleus', subtopics: ['Radioactivity Alpha/Beta/Gamma', 'Nuclear Fission & Fusion'] },
        { id: 'wp10-6', name: 'Chemical Bonding & Electrolysis', subtopics: ['Periodic Table Modern & Trends', 'Ionic & Covalent Bonding Lewis dot', 'Electrolysis & Electroplating'] },
        { id: 'wp10-7', name: 'Inorganic Chemistry & Metallurgy', subtopics: ['Lab Prep Ammonia & Hydrogen Sulfide', 'Metallurgy Extraction Iron/Al/Cu', 'Organic Chemistry Alkanes & Isomerism'] }
      ]
    },
    {
      id: 'wbbse-life-10',
      name: 'Life Science',
      icon: 'biology',
      color: '#22c55e',
      topics: [
        { id: 'wl10-1', name: 'Control & Coordination in Organisms', subtopics: ['Sensory Response in Plants Auxin', 'Animal Hormones Thyroid/Insulin', 'Nervous System Reflex Action', 'Structure of Human Eye Defects'] },
        { id: 'wl10-2', name: 'Continuity of Life', subtopics: ['Chromosome Structure DNA', 'Cell Division Mitosis Phases', 'Asexual reproduction methods', 'Sexual reproduction in Plants'] },
        { id: 'wl10-3', name: 'Heredity & Genetic Diseases', subtopics: ['Mendels Law Hybrid Crosses', 'Sex Determination in Humans', 'Thalassemia & Haemophilia Color Blind'] },
        { id: 'wl10-4', name: 'Evolution & Adaptation', subtopics: ['Lamarckism vs Darwinism Theories', 'Homologous & Analogous Organs', 'Adaptations Sundari/Cactus/Fish/Pigeon'] },
        { id: 'wl10-5', name: 'Environment Resources & Conservation', subtopics: ['Nitrogen Cycle Stages', 'Air & Water Pollution Causes', 'Biodiversity Hotspots Sundarbans', 'JFM & PBR Conservation'] }
      ]
    }
  ]
};

// ═════════════════════════════════════════════════════════════════════════════
//  CBSE SYLLABUS DATA (Class 9 & 10)
// ═════════════════════════════════════════════════════════════════════════════
const CBSE_SYLLABUS: Record<number, SubjectSyllabus[]> = {
  9: [
    {
      id: 'cbse-math-9',
      name: 'Mathematics',
      icon: 'math',
      color: '#2dd4bf',
      topics: [
        { id: 'cm9-1', name: 'Number Systems', subtopics: ['Real Numbers', 'Irrational Numbers', 'Laws of Exponents', 'Decimal Expansions'] },
        { id: 'cm9-2', name: 'Polynomials', subtopics: ['Remainder Theorem', 'Factor Theorem', 'Algebraic Identities'] },
        { id: 'cm9-3', name: 'Linear Equations in Two Variables', subtopics: ['Solution of Linear Equation', 'Graph of Linear Equation'] },
        { id: 'cm9-4', name: 'Coordinate Geometry', subtopics: ['Cartesian Plane', 'Plotting Points'] },
        { id: 'cm9-5', name: 'Geometry', subtopics: ['Lines and Angles', 'Triangles congruence', 'Quadrilaterals properties', 'Circles theorems'] },
        { id: 'cm9-6', name: 'Mensuration', subtopics: ['Herons Formula', 'Surface Areas and Volumes'] }
      ]
    },
    {
      id: 'cbse-phys-9',
      name: 'Physics',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'cp9-1', name: 'Motion', subtopics: ['Distance and Displacement', 'Speed and Velocity', 'Equations of Motion', 'Uniform Circular Motion'] },
        { id: 'cp9-2', name: 'Force & Laws of Motion', subtopics: ['Newton First Law Inertia', 'Newton Second Law Momentum', 'Newton Third Law Action Reaction'] },
        { id: 'cp9-3', name: 'Gravitation', subtopics: ['Universal Gravitation Law', 'Free Fall Acceleration', 'Mass vs Weight'] },
        { id: 'cp9-4', name: 'Work and Energy', subtopics: ['Work Done by Constant Force', 'Kinetic Energy & Potential Energy', 'Conservation of Energy'] }
      ]
    },
    {
      id: 'cbse-chem-9',
      name: 'Chemistry',
      icon: 'chemistry',
      color: '#10b981',
      topics: [
        { id: 'cc9-1', name: 'Matter in Our Surroundings', subtopics: ['States of Matter solid/liquid/gas', 'Latent Heat Evaporation'] },
        { id: 'cc9-2', name: 'Is Matter Around Us Pure', subtopics: ['Mixtures Solutions Suspensions', 'Separation of Mixtures'] },
        { id: 'cc9-3', name: 'Atoms & Molecules', subtopics: ['Laws of Chemical Combinations', 'Atomic and Molecular Masses', 'Mole Concept'] },
        { id: 'cc9-4', name: 'Structure of Atom', subtopics: ['Rutherfords Scattering Model', 'Bohr Model of Atom', 'Valency and Isotopes'] }
      ]
    },
    {
      id: 'cbse-bio-9',
      name: 'Biology',
      icon: 'biology',
      color: '#22c55e',
      topics: [
        { id: 'cb9-1', name: 'The Fundamental Unit of Life', subtopics: ['Cell Theory Structure', 'Cell Organelles function'] },
        { id: 'cb9-2', name: 'Tissues', subtopics: ['Plant Tissues Meristematic', 'Animal Tissues Connective'] },
        { id: 'cb9-3', name: 'Improvement in Food Resources', subtopics: ['Crop Yield Management', 'Animal Husbandry Breeding'] }
      ]
    }
  ],
  10: [
    {
      id: 'cbse-math-10',
      name: 'Mathematics',
      icon: 'math',
      color: '#2dd4bf',
      topics: [
        { id: 'cm10-1', name: 'Real Numbers & Polynomials', subtopics: ['Fundamental Theorem of Arithmetic', 'Irrationality Proofs', 'Relationship of Zeroes & Coefficients'] },
        { id: 'cm10-2', name: 'Linear Equations Two Variables', subtopics: ['Graphical Solutions', 'Substitution & Elimination Methods'] },
        { id: 'cm10-3', name: 'Quadratic Equations & AP', subtopics: ['Standard Form factorization', 'Quadratic Formula Nature of Roots', 'Arithmetic Progression nth term', 'Sum of n Terms of AP'] },
        { id: 'cm10-4', name: 'Trigonometry', subtopics: ['Trigonometric Ratios identities', 'Heights and Distances Angle of Elevation'] },
        { id: 'cm10-5', name: 'Coordinate Geometry & Triangles', subtopics: ['Distance & Section Formulas', 'Similarity of Triangles'] },
        { id: 'cm10-6', name: 'Circles & Mensuration', subtopics: ['Tangents to Circle Theorems', 'Areas Related to Circles Sectors', 'Surface Areas & Volumes Combination'] },
        { id: 'cm10-7', name: 'Statistics & Probability', subtopics: ['Mean Median Mode grouped', 'Probability simple events'] }
      ]
    },
    {
      id: 'cbse-phys-10',
      name: 'Physics',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'cp10-1', name: 'Light Reflection & Refraction', subtopics: ['Mirror Formula spherical', 'Lens Formula & Power', 'Refraction Snell Law'] },
        { id: 'cp10-2', name: 'Human Eye & Colorful World', subtopics: ['Defects of Vision correction', 'Prism Refraction dispersion', 'Atmospheric Refraction scattering'] },
        { id: 'cp10-3', name: 'Electricity', subtopics: ['Electric Current Potential', 'Ohms Law & Resistance Factors', 'Joule Heating Series Parallel'] },
        { id: 'cp10-4', name: 'Magnetic Effects of Current', subtopics: ['Magnetic Field Lines Solenoid', 'Force on Current Carrier Motor', 'Electromagnetic Induction Generator'] }
      ]
    },
    {
      id: 'cbse-chem-10',
      name: 'Chemistry',
      icon: 'chemistry',
      color: '#10b981',
      topics: [
        { id: 'cc10-1', name: 'Chemical Reactions', subtopics: ['Balancing Chemical Equations', 'Types of Reactions Combination/Decomp', 'Oxidation Reduction Redox'] },
        { id: 'cc10-2', name: 'Acids, Bases & Salts', subtopics: ['pH Scale importance', 'Chemicals from Common Salt'] },
        { id: 'cc10-3', name: 'Metals and Non-Metals', subtopics: ['Physical Chemical properties', 'Reactivity Series extraction'] },
        { id: 'cc10-4', name: 'Carbon & its Compounds', subtopics: ['Covalent Bonding allotropes', 'Homologous Series functional group', 'Saponification soap detergent'] }
      ]
    },
    {
      id: 'cbse-bio-10',
      name: 'Biology',
      icon: 'biology',
      color: '#22c55e',
      topics: [
        { id: 'cb10-1', name: 'Life Processes', subtopics: ['Nutrition Autotrophic/Hetero', 'Respiration cellular', 'Transportation heart double circulation', 'Excretion nephron structures'] },
        { id: 'cb10-2', name: 'Control and Coordination', subtopics: ['Nervous System Reflex Arc', 'Hormones in Animals thyroid/adrenal', 'Plant Movements phototropism'] },
        { id: 'cb10-3', name: 'How do Organisms Reproduce', subtopics: ['Asexual fission budding fragmentation', 'Sexual reproduction flowering plants', 'Human reproduction puberty health'] },
        { id: 'cb10-4', name: 'Heredity & Environment', subtopics: ['Mendelian laws of heredity', 'Sex Determination determination', 'Ecosystem Food Web', 'Ozone depletion Waste management'] }
      ]
    }
  ]
};

// ═════════════════════════════════════════════════════════════════════════════
//  ICSE SYLLABUS DATA (Class 9 & 10)
// ═════════════════════════════════════════════════════════════════════════════
const ICSE_SYLLABUS: Record<number, SubjectSyllabus[]> = {
  9: [
    {
      id: 'icse-math-9',
      name: 'Mathematics',
      icon: 'math',
      color: '#2dd4bf',
      topics: [
        { id: 'im9-1', name: 'Rational & Irrational Numbers', subtopics: ['Rational Numbers representation', 'Irrational Numbers surds'] },
        { id: 'im9-2', name: 'Commercial Arithmetic', subtopics: ['Compound Interest formula', 'Simple Interest comparison'] },
        { id: 'im9-3', name: 'Algebra', subtopics: ['Expansion Identities', 'Factorisation grouping split', 'Simultaneous Equations'] },
        { id: 'im9-4', name: 'Geometry', subtopics: ['Triangles congruence inequalities', 'Midpoint Theorem converse', 'Pythagoras Theorem applications'] }
      ]
    },
    {
      id: 'icse-phys-9',
      name: 'Physics',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'ip9-1', name: 'Measurements & Experimentation', subtopics: ['Vernier Calipers Micrometer Screw', 'Simple Pendulum measurements'] },
        { id: 'ip9-2', name: 'Motion in 1D & Laws of Motion', subtopics: ['Scalar Vector speed velocity', 'Equations of motion graphs', 'Newton Laws Inertia force'] },
        { id: 'ip9-3', name: 'Fluids Pressure & Archimedes', subtopics: ['Thrust Pressure buoyancy', 'Archimedes Principle relative density'] }
      ]
    }
  ],
  10: [
    {
      id: 'icse-math-10',
      name: 'Mathematics',
      icon: 'math',
      color: '#2dd4bf',
      topics: [
        { id: 'im10-1', name: 'Commercial Mathematics', subtopics: ['GST Goods Services Tax', 'Banking Recurring Deposit RD', 'Shares and Dividends yield'] },
        { id: 'im10-2', name: 'Algebraic Equations', subtopics: ['Linear Inequations properties', 'Quadratic Equation factorization/formula', 'Ratio & Proportion componendo-dividendo', 'Factorisation Factor/Remainder Theorems', 'Matrices Addition/Multiply'] },
        { id: 'im10-3', name: 'Progressions & Coordinate', subtopics: ['Arithmetic Progression AP', 'Geometric Progression GP', 'Reflection of Points in axes', 'Section & Midpoint Formulas', 'Equation of a Line slope intercepts'] },
        { id: 'im10-4', name: 'Geometry Circles & Mensuration', subtopics: ['Similarity scale factor map', 'Tangents Secants angles Circle', 'Right Circular Cylinder Area/Vol', 'Right Circular Cone Area/Vol', 'Sphere/Hemisphere Surface/Vol'] },
        { id: 'im10-5', name: 'Trigonometry & Statistics', subtopics: ['Trigonometric Identities proofs', 'Heights and Distances clinometer', 'Mean Median Mode grouped', 'Ogive Median Quartile calculation'] }
      ]
    },
    {
      id: 'icse-phys-10',
      name: 'Physics',
      icon: 'physics',
      color: '#3b82f6',
      topics: [
        { id: 'ip10-1', name: 'Force, Work, Power & Energy', subtopics: ['Moment of Force equilibrium', 'Center of Gravity regular shapes', 'Work done Potential/Kinetic energy', 'Simple Machines Pulley Gear velocity'] },
        { id: 'ip10-2', name: 'Light Refraction & Spectrum', subtopics: ['Refraction at Plane Surfaces', 'Lenses Refraction images power', 'Spectrum prism dispersion electromagnetic'] },
        { id: 'ip10-3', name: 'Sound Waves', subtopics: ['Reflection Sound echo sonar', 'Natural Damped Forced vibrations', 'Resonance loudness pitch quality'] },
        { id: 'ip10-4', name: 'Electricity & Magnetism', subtopics: ['Ohms Law equivalent resistance', 'Electrical Energy Power household fuse', 'Magnetic field solenoid electromagnet', 'Fleming Left Hand Rule Motor'] },
        { id: 'ip10-5', name: 'Heat & Calorimetry', subtopics: ['Heat capacity specific heat capacity', 'Latent heat phase change calorimetry'] },
        { id: 'ip10-6', name: 'Modern Physics (Radioactivity)', subtopics: ['Structure of Atom Nucleus radioactivity', 'Alpha Beta Gamma emission background'] }
      ]
    },
    {
      id: 'icse-chem-10',
      name: 'Chemistry',
      icon: 'chemistry',
      color: '#10b981',
      topics: [
        { id: 'ic10-1', name: 'Periodic Table & Bonding', subtopics: ['Modern Periodic Table groups periods', 'Periodic Trends ionization electronegativity', 'Electrovalent Covalent Coordinate bonds', 'Electron dot structures Lewis'] },
        { id: 'ic10-2', name: 'Analytical & Mole Concept', subtopics: ['Action of Alkalis salts', 'Mole Concept Avogadro Law', 'Vapour Density empirical formula stoichiometry'] },
        { id: 'ic10-3', name: 'Electrolysis & Metallurgy', subtopics: ['Electrolytes cations anions discharge', 'Electroplating & Refining copper', 'Metallurgy aluminum extraction Hall-Heroult'] },
        { id: 'ic10-4', name: 'Study of Compounds', subtopics: ['Hydrogen Chloride fountain experiment', 'Ammonia Haber process laboratory', 'Nitric Acid laboratory preparation Ostwald', 'Sulphuric Acid Contact process oxidising'] },
        { id: 'ic10-5', name: 'Organic Chemistry', subtopics: ['Alkanes Alkenes Alkynes nomenclature', 'Isomerism chain position', 'Preparation of Methane Ethane Ethyne'] }
      ]
    },
    {
      id: 'icse-bio-10',
      name: 'Biology',
      icon: 'biology',
      color: '#22c55e',
      topics: [
        { id: 'ib10-1', name: 'Basic Biology', subtopics: ['Cell Cycle phases interphase mitosis', 'Chromosome Structure centromere chromatin', 'Mendels Laws monohybrid dihybrid crosses'] },
        { id: 'ib10-2', name: 'Plant Physiology', subtopics: ['Absorption by Roots turgidity plasmolysis', 'Transpiration factors photometer', 'Photosynthesis chloroplast light/dark reactions'] },
        { id: 'ib10-3', name: 'Human Anatomy & Physiology', subtopics: ['Circulatory System Blood heart double', 'Excretory System nephron urine formation', 'Nervous System synapse brain spinal reflex', 'Endocrine System hormones thyroid adrenal pit', 'Reproductive System menstrual fertilization'] }
      ]
    }
  ]
};

// ═════════════════════════════════════════════════════════════════════════════
//  FALLBACK DEFAULT / GENERIC SYLLABUS
// ═════════════════════════════════════════════════════════════════════════════
const DEFAULT_SYLLABUS = CBSE_SYLLABUS;

// ═════════════════════════════════════════════════════════════════════════════
//  CURRICULUM RESOLVER FUNCTION
// ═════════════════════════════════════════════════════════════════════════════
export function getSyllabus(
  board: string = 'CBSE',
  targetExam: string = 'Board Exams',
  classNum: number = 10
): SubjectSyllabus[] {
  console.log(`Resolving syllabus for Board: ${board}, Target: ${targetExam}, Class: ${classNum}`);

  const normBoard = board.toUpperCase();
  const normExam = targetExam.toUpperCase();

  // 1. JEE Curriculum priority
  if (normExam === 'JEE') {
    if (classNum === 11 || classNum === 12) {
      return JEE_SYLLABUS[classNum] || JEE_SYLLABUS[12];
    }
    // Support early JEE preppers (Class 9 & 10) by providing Maths, Physics, Chemistry foundations
    // Resolve to CBSE science components (separate Physics & Chemistry) + Math instead of combined general/physical science
    const cbseSyllabus = CBSE_SYLLABUS[classNum] || CBSE_SYLLABUS[10];
    return cbseSyllabus.filter(s => s.id.includes('math') || s.id.includes('phys') || s.id.includes('chem'));
  }

  // 2. NEET Curriculum priority
  if (normExam === 'NEET') {
    if (classNum === 11 || classNum === 12) {
      return NEET_SYLLABUS[classNum] || NEET_SYLLABUS[12];
    }
    // Early NEET preppers (Class 9 & 10) get Biology, Physics, Chemistry foundations
    const cbseSyllabus = CBSE_SYLLABUS[classNum] || CBSE_SYLLABUS[10];
    return cbseSyllabus.filter(s => s.id.includes('bio') || s.id.includes('phys') || s.id.includes('chem'));
  }

  // 3. Board-specific curriculum
  if (normBoard === 'WBBSE' || normBoard.includes('WEST BENGAL')) {
    // If Class 11/12, fallback to JEE/NEET subjects or CBSE equivalent as WBBSE (WBCHSE) matches national
    if (classNum === 11 || classNum === 12) {
      return JEE_SYLLABUS[classNum] || WBBSE_SYLLABUS[10];
    }
    return WBBSE_SYLLABUS[classNum] || WBBSE_SYLLABUS[10];
  }

  if (normBoard === 'ICSE' || normBoard === 'ISC') {
    if (classNum === 11 || classNum === 12) {
      return JEE_SYLLABUS[classNum] || ICSE_SYLLABUS[10]; // Fallback to JEE subjects for ISC science
    }
    return ICSE_SYLLABUS[classNum] || ICSE_SYLLABUS[10];
  }

  // 4. Default to CBSE
  const cbseClassData = CBSE_SYLLABUS[classNum];
  if (cbseClassData) return cbseClassData;

  // 5. Ultimate fallback for College/Other classes
  if (classNum === 11 || classNum === 12) {
    return JEE_SYLLABUS[classNum] || JEE_SYLLABUS[12];
  }
  return DEFAULT_SYLLABUS[10];
}

export const syllabusData: ClassSyllabus[] = [
  { classNumber: 9, label: 'Class 9', subjects: CBSE_SYLLABUS[9] },
  { classNumber: 10, label: 'Class 10', subjects: CBSE_SYLLABUS[10] },
  { classNumber: 11, label: 'Class 11', subjects: JEE_SYLLABUS[11] },
  { classNumber: 12, label: 'Class 12', subjects: JEE_SYLLABUS[12] },
];
