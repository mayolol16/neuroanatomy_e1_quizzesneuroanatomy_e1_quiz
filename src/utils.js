import stringSimilarity from 'string-similarity';

export const ALTERNATIVE_ANSWERS = {
  "als": ["lateral spinothalamic tract", "anterolateral system", "spinothalamic tract"],
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
  "corticospinal tract": ["pyramidal tract"],
  "mlf": ["medial longitudinal fasciculus"],
  "fourth ventricle": ["4th ventricle", "iv ventricle"],
  "third ventricle": ["3rd ventricle", "iii ventricle"],
  "ventral trigeminothalamic tract": ["vtt", "ventral trigeminalthalamic tract", "ventral trigeminal tract", "ventral trigeminothalamic"],
  "vtt": ["ventral trigeminothalamic tract", "ventral trigeminalthalamic tract", "ventral trigeminal tract"],
  "trigeminal nerve": ["cn v", "cn 5", "cranial nerve v", "cranial nerve 5", "cranial nerve five"],
  "cn v": ["trigeminal nerve", "cranial nerve v", "cn 5", "cranial nerve 5"],
  "fibers of trigeminal nerve": ["trigeminal nerve fibers", "cn v fibers", "cn 5 fibers"],
  "chief sensory nucleus of v": ["principal sensory nucleus of v", "main sensory nucleus of v", "chief sensory nucleus of 5"],
  "trigeminal motor nucleus": ["motor nucleus of v", "motor nucleus of 5", "masticatory nucleus"],
  "pag": ["periaqueductal gray", "periaqueductal grey", "central gray"],
  "periaqueductal gray": ["pag", "periaqueductal grey", "central gray"],
  "vpl": ["ventral posterolateral nucleus", "ventral posterolateral", "vpl nucleus"],
  "vpm": ["ventral posteromedial nucleus", "ventral posteromedial", "vpm nucleus"],
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
  "internal capsule anterior limb": ["anterior limb of internal capsule", "anterior limb internal capsule"],
  "internal capsule posterior limb": ["posterior limb of internal capsule", "posterior limb internal capsule"],
  "internal capsule genu": ["genu of internal capsule", "genu internal capsule"],
  "central sulcus": ["fissure of rolando", "rolandic fissure"],
  "postcentral gyrus": ["primary somatosensory cortex", "somatosensory cortex", "s1"],
  "cingulate gyrus": ["cingulate cortex"],
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
