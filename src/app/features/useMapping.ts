import { useState } from "react";

export function useMapping() {
  const [showMapping, setShowMapping] = useState(false);
  const [attributeMapping, setAttributeMapping] = useState<
    Record<string, string>
  >({});

  const [reverseMapping, setReverseMapping] = useState<Record<string, string>>(
    {}
  );
  const [nextLetter, setNextLetter] = useState("A");

  const getNextLetter = (current: string): string => {
    if (!current) return "A";

    const lastChar = current[current.length - 1];
    if (lastChar === "Z") {
      if (current.length === 1) return "AA";
      return current.slice(0, -1) + "AA";
    }

    return (
      current.slice(0, -1) + String.fromCharCode(lastChar.charCodeAt(0) + 1)
    );
  };

  const addMapping = () => {
    const newKey = `ATTR${Object.keys(attributeMapping).length + 1}`;
    setAttributeMapping({
      ...attributeMapping,
      [newKey]: nextLetter,
    });

    setReverseMapping({
      ...reverseMapping,
      [nextLetter]: newKey,
    });
    setNextLetter(getNextLetter(nextLetter));
  };

  const removeMapping = (key: string) => {
    const shortName = attributeMapping[key];
    const newMapping = { ...attributeMapping };
    delete newMapping[key];
    setAttributeMapping(newMapping);

    const newReverse = { ...reverseMapping };
    delete newReverse[shortName];
    setReverseMapping(newReverse);
  };

  const updateMapping = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;

    const shortName = attributeMapping[oldKey];
    const newMapping = { ...attributeMapping };
    newMapping[newKey] = newMapping[oldKey];
    delete newMapping[oldKey];
    setAttributeMapping(newMapping);
    // ⭐ Update reverseMapping
    const newReverse = { ...reverseMapping };
    newReverse[shortName] = newKey;
    setReverseMapping(newReverse);
  };

  const applyMapping = (
    dependencies: { left: string; right: string }[]
  ): { left: string; right: string }[] => {
    const newDeps = dependencies.map((dep) => {
      let newLeft = dep.left;
      let newRight = dep.right;

      Object.entries(attributeMapping).forEach(([longName, shortName]) => {
        newLeft = newLeft.replace(new RegExp(longName, "g"), shortName);
        newRight = newRight.replace(new RegExp(longName, "g"), shortName);
      });

      return { left: newLeft, right: newRight };
    });
    return newDeps;
  };

  const reset = () => {
    setAttributeMapping({});
    setReverseMapping({});
    setNextLetter("A");
  };

  const decodeString = (input: string): string => {
    let result = input;

    Object.entries(reverseMapping)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([shortName, longName]) => {
        result = result.replace(
          new RegExp(
            `(?<!\\\\)(?<![\\p{L}\\p{N}_])${shortName}(?![\\p{L}\\p{N}_])`,
            "gu"
          ),
          longName
        );
      });

    return result;
  };

  return {
    showMapping,
    setShowMapping,
    attributeMapping,
    reverseMapping,
    nextLetter,
    addMapping,
    removeMapping,
    updateMapping,
    applyMapping,
    decodeString,
    reset,
  };
}
