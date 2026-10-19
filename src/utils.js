import stringSimilarity from 'string-similarity';

export const ALTERNATIVE_ANSWERS = {
  // Sensory & General Tracts
  "als": ["lateral spinothalamic tract", "anterolateral system", "spinothalamic tract"],
  "alslateral lemniscus": ["als", "lateral lemniscus", "anterolateral system", "spinothalamic tract", "lateral spinothalamic tract", "als lateral lemniscus"],
  "lateral lemniscus": ["lateral lemniscal tract"],
  "spinal trigeminal nucleus": ["nucleus of the spinal tract of v", "spinal nucleus of v", "spinal nucleus of 5"],
  "spinal trigeminal tract": ["spinal tract of v", "spinal tract of 5"],
  "spinal trigeminal nucleustract": ["spinal trigeminal nucleus and tract", "spinal tract of v", "nucleus of the spinal tract of v", "spinal trigeminal nucleus", "spinal trigeminal tract"],
  "fasciculus gracilis": ["gracile fasciculus", "tract of goll"],
  "fasciculus cuneatus": ["cuneate fasciculus", "tract of burdach"],
  "nucleus gracilis": ["gracile nucleus"],
  "nucleus cuneatus": ["cuneate nucleus"],
  "medial lemniscus": ["reils band", "ribbon of reil"],
  "decussation of medial lemniscus": ["internal arcuate fibers decussation", "sensory decussation"],
  "internal arcuate fibers": ["internal arcuate fibres"],

  // Motor & Corticospinal System
  "corticospinal tract": ["pyramidal tract", "lateral corticospinal tract", "cst", "anterior corticospinal tract", "corticospinal"],
  "pyramidal decussation": ["decussation of the pyramids", "decussation of pyramids", "motor decussation", "corticospinal decussation"],
  "red nucleus": ["nucleus ruber"],

  // Cranial Nerves, Nuclei & Decussations
  "mlf": ["medial longitudinal fasciculus"],
  "medial longitudinal fasciculus": ["mlf"],
  "trigeminal nerve": ["cn v", "cn 5", "cranial nerve v", "cranial nerve 5", "cranial nerve five"],
  "cn v": ["trigeminal nerve", "cranial nerve v", "cn 5", "cranial nerve 5", "trigeminal"],
  "fibers of trigeminal nerve": ["trigeminal nerve fibers", "cn v fibers", "cn 5 fibers"],
  "chief sensory nucleus of v": ["principal sensory nucleus of v", "main sensory nucleus of v", "chief sensory nucleus of 5"],
  "trigeminal motor nucleus": ["motor nucleus of v", "motor nucleus of 5", "masticatory nucleus", "cn v motor nucleus"],
  "ventral trigeminothalamic tract": ["vtt", "ventral trigeminalthalamic tract", "ventral trigeminal tract", "ventral trigeminothalamic"],
  "vtt": ["ventral trigeminothalamic tract", "ventral trigeminalthalamic tract", "ventral trigeminal tract"],

  "oculomotor nerve iii": ["cn iii", "cn 3", "oculomotor nerve", "cranial nerve iii", "cranial nerve 3", "oculomotor", "cn 3 oculomotor"],
  "cn iii": ["oculomotor nerve", "cranial nerve iii", "cranial nerve 3", "cn 3", "oculomotor", "oculomotor nerve iii"],
  "oculomotor nucleus": ["nucleus of oculomotor nerve", "cn iii nucleus", "cn 3 nucleus", "oculomotor nerve nucleus"],

  "cn iv": ["trochlear nerve", "cranial nerve iv", "cranial nerve 4", "cn 4", "trochlear"],
  "trochlear nucleus": ["nucleus of trochlear nerve", "cn iv nucleus", "cn 4 nucleus", "trochlear nerve nucleus"],
  "decussation of trochlear nerve": ["trochlear nerve decussation", "decussation of cn iv", "decussation of cn 4", "trochlear decussation"],

  "cn vi": ["abducens nerve", "cranial nerve vi", "cranial nerve 6", "cn 6", "abducens", "abducent nerve"],
  "abducens nucleus": ["nucleus of abducens nerve", "cn vi nucleus", "cn 6 nucleus", "abducent nucleus", "abducens nerve nucleus"],

  "cn vii": ["facial nerve", "cranial nerve vii", "cranial nerve 7", "cn 7", "facial"],
  "facial nucleus": ["motor nucleus of facial nerve", "cn vii nucleus", "cn 7 nucleus", "facial motor nucleus", "facial nerve nucleus"],

  "cn viii": ["vestibulocochlear nerve", "cranial nerve viii", "cranial nerve 8", "cn 8", "auditory nerve", "acoustic nerve"],
  "cochlear portion of viii": ["cochlear nerve", "cochlear division of cn viii", "cochlear division of cn 8", "cochlear branch of cn viii", "auditory nerve", "cochlear portion of cn viii", "cochlear division of vestibulocochlear nerve", "cochlear nerve viii"],
  "vestibular portion of viii": ["vestibular nerve", "vestibular division of cn viii", "vestibular division of cn 8", "vestibular branch of cn viii", "vestibular nerve viii", "vestibular portion of cn viii", "vestibular division of vestibulocochlear nerve"],
  "dorsal cochlear nucleus": ["posterior cochlear nucleus", "tuberculum acousticum"],
  "medial vestibular nucleus": ["nucleus of schwalbe", "triangular nucleus", "medial vestibular"],
  "inferior vestibular nucleus": ["spinal vestibular nucleus", "descending vestibular nucleus", "nucleus of roller", "inferior vestibular"],
  "superior olivary nucleus": ["superior olive", "superior olivary complex", "soc"],

  "dorsal motor nucleus of vagus": ["dorsal motor nucleus of cn x", "dorsal motor nucleus of 10", "dorsal motor nucleus of cn 10", "dmn of vagus", "dmn of x", "dmnx", "dorsal motor nucleus of the vagus nerve"],
  "solitary tract": ["tractus solitarius", "solitary fasciculus", "solitary tract and nucleus"],
  "hypoglossal nucleus": ["nucleus of hypoglossal nerve", "cn xii nucleus", "cn 12 nucleus", "hypoglossal motor nucleus", "hypoglossal nerve nucleus"],
  "cn xii": ["hypoglossal nerve", "cranial nerve xii", "cranial nerve 12", "cn 12", "hypoglossal"],

  "olfactory bulb": ["bulbus olfactorius", "cn i bulb", "cn 1 bulb", "olfactory bulb cn i"],
  "olfactory tract": ["tractus olfactorius", "cn i tract", "cn 1 tract"],

  // Auditory & Visual / Colliculi / Geniculate Bodies
  "inferior colliculus": ["inferior colliculi", "ic"],
  "superior colliculus": ["superior colliculi", "sc"],
  "medial geniculate nucleus": ["medial geniculate body", "mgn", "mgb"],
  "lateral geniculate nucleus": ["lateral geniculate body", "lgn", "lgb"],
  "pretectal area": ["pretectum", "pretectal nucleus", "pretectal nuclei"],
  "optic tract": ["tractus opticus"],
  "optic chiasm": ["optic chiasma"],
  "optic nerve": ["cn ii", "cn 2", "cranial nerve ii", "cranial nerve 2", "optic nerve ii"],

  // Ear Anatomy
  "pinna": ["auricle", "outer ear", "auricula"],
  "external ear": ["outer ear", "external acoustic meatus"],
  "middle ear": ["tympanic cavity", "tympanum"],
  "inner ear": ["internal ear", "labyrinth"],
  "tympanic membrane": ["eardrum", "ear drum", "tympanum", "myringa"],
  "semicircular canals": ["semicircular ducts"],
  "cochlea": ["cochlear canal"],
  "oval window": ["fenestra vestibuli", "vestibular window"],
  "ossicles": ["auditory ossicles", "ear bones", "malleus incus stapes"],

  // Eye Anatomy (Includes tolerance for course typos "Slera" and "Chroroid")
  "ciliary body": ["corpus ciliare"],
  "cornea": ["corneal layer"],
  "iris": ["iridial area"],
  "pupil": ["pupillary aperture"],
  "lens": ["crystalline lens"],
  "anterior chamber": ["anterior chamber of eye", "anterior eye chamber"],
  "posterior chamber": ["posterior chamber of eye", "posterior eye chamber"],
  "slera": ["sclera", "scleral coat", "white of eye"],
  "sclera": ["slera", "scleral coat", "white of eye"],
  "chroroid": ["choroid", "choroid coat", "choroidea"],
  "choroid": ["chroroid", "choroid coat", "choroidea"],
  "retina": ["retinal layer", "neural retina"],
  "fovea": ["fovea centralis", "macula", "macula lutea"],
  "vitreous chamber": ["vitreous body", "vitreous cavity", "posterior cavity", "vitreous humor"],
  "optic disc": ["optic disk", "blind spot", "optic papilla"],

  // Forebrain, Ventricles, Cortex
  "pag": ["periaqueductal gray", "periaqueductal grey", "central gray"],
  "periaqueductal gray": ["pag", "periaqueductal grey", "central gray"],
  "vpl": ["ventral posterolateral nucleus", "ventral posterolateral", "vpl nucleus"],
  "vpm": ["ventral posteromedial nucleus", "ventral posteromedial", "vpm nucleus"],
  "fourth ventricle": ["4th ventricle", "iv ventricle"],
  "third ventricle": ["3rd ventricle", "iii ventricle"],
  "anterior white commissure": ["ventral white commissure"],
  "dorsal median sulcus": ["posterior median sulcus"],
  "dorsolateral fasciculus": ["tract of lissauer", "lissauers tract"],
  "dorsolateral sulcus": ["posterolateral sulcus"],
  "substantia gelatinosa": ["lamina ii", "lamina 2"],
  "nucleus proprius": ["lamina iii and iv", "lamina 3 and 4"],
  "intermediolateral cell column": ["iml", "lateral horn"],
  "ventral median fissure": ["anterior median fissure"],
  "cerebral aqueduct": ["aqueduct of sylvius", "mesencephalic aqueduct"],
  "interventricular foramen": ["foramen of monro"],
  "lateral ventricle anterior horn": ["frontal horn of lateral ventricle", "anterior horn of lateral ventricle", "anterior horn", "frontal horn"],
  "lateral ventricle posterior horn": ["occipital horn of lateral ventricle", "posterior horn of lateral ventricle", "posterior horn", "occipital horn"],
  "lateral ventricle temporal horn": ["inferior horn of lateral ventricle", "temporal horn of lateral ventricle", "lateral ventricle inferior horn", "inferior horn", "temporal horn"],
  "internal capsule": ["capsula interna"],
  "internal capsule anterior limb": ["anterior limb of internal capsule", "anterior limb internal capsule"],
  "internal capsule posterior limb": ["posterior limb of internal capsule", "posterior limb internal capsule"],
  "internal capsule genu": ["genu of internal capsule", "genu internal capsule", "genu"],
  "central sulcus": ["fissure of rolando", "rolandic fissure"],
  "postcentral gyrus": ["primary somatosensory cortex", "somatosensory cortex", "s1"],
  "cingulate gyrus": ["cingulate cortex"],
  "paracentral lobule": ["paracentral gyrus"],
  "calcarine sulcus": ["calcarine fissure"],
  "cuneus": ["cuneus gyrus", "cuneate gyrus"],
  "lingual gyrus": ["medial occipitotemporal gyrus", "lingual cortex"],
  "uncus": ["uncus of parahippocampal gyrus", "uncus hippocampi"],
  "hypothalamus": ["hypothalamic area", "hypothalamic nuclei"],
  "thalamus": ["dorsal thalamus"],
  "insula": ["insular cortex", "island of reil"],

  // Meninges
  "subarachnoid space": ["subarachnoid cavity"],
  "pia": ["pia mater"],
  "dura": ["dura mater"],
  "arachnoid": ["arachnoid mater"],
  "gray matter": ["grey matter", "substantia grisea"],
  "white matter": ["substantia alba"],
};

export const checkAnswer = (userAns, correctAns) => {
  if (!userAns) return false;
  const clean = (str) => str.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
  
  const cleanUser = clean(userAns);
  const cleanCorrect = clean(correctAns);
  
  // Check main answer
  if (cleanUser === cleanCorrect || stringSimilarity.compareTwoStrings(cleanUser, cleanCorrect) > 0.8) {
    return true;
  }
  
  // Check alternatives
  const alternatives = ALTERNATIVE_ANSWERS[cleanCorrect] || [];
  for (const alt of alternatives) {
    const cleanAlt = clean(alt);
    if (cleanUser === cleanAlt || stringSimilarity.compareTwoStrings(cleanUser, cleanAlt) > 0.8) {
      return true;
    }
  }
  
  return false;
};

export const isExamMistake = (m, targetExam) => {
  if (!m) return false;
  if (targetExam === 'exam2') {
    return m.exam === 'exam2' || (m.id && String(m.id).startsWith('exam2_'));
  }
  if (targetExam === 'exam1') {
    return m.exam === 'exam1' || (m.id && String(m.id).startsWith('exam1_')) || (!m.exam && !String(m.id).startsWith('exam2_'));
  }
  return true;
};
