export const obfuscate = (obfuscateString) => {
  if (obfuscateString) {
    if (obfuscateString.length < 2) {
      return obfuscateString;
    }
    return (
      obfuscateString.substring(0, 2) +
      '******' +
      obfuscateString.substring(obfuscateString.length - 2)
    );
  }
  return '';
};
