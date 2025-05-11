export const sortOptions = (arr) => [...arr].sort((a, b) => a.localeCompare(b));

export const nuclearFeatureSort = (features) => {
  const fRegex = /_F(\d{1,2})$/;
  const fNumbered = [];
  const others = [];

  features.forEach((name) => {
    const match = name.match(fRegex);
    if (match) {
      fNumbered.push({ name, num: parseInt(match[1], 10) });
    } else {
      others.push(name);
    }
  });

  fNumbered.sort((a, b) => a.num - b.num);

  return [
    ...fNumbered.map((item) => item.name),
    ...others.sort((a, b) => a.localeCompare(b)),
  ];
};

export const validateQueryForm = (data) => {
  const { 
    selectedDatabase1, selectedSubCategories1, feature1,
    selectedDatabase2, selectedSubCategories2, feature2 
  } = data;
  
  return (
    selectedDatabase1.length > 0 &&
    selectedSubCategories1.length > 0 &&
    feature1 !== '' &&
    selectedDatabase2.length > 0 &&
    selectedSubCategories2.length > 0 &&
    feature2.length > 0
  );
}; 