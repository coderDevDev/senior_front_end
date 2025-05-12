export const generateRandomUsername = () => {
  const adjectives = ["Quick", "Brave", "Clever", "Mighty", "Silent"];
  const animals = ["Fox", "Tiger", "Bear", "Eagle", "Shark"];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomAnimal}${randomNumber}`;
};

export default generateRandomUsername
