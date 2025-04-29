export const generateSlug = (title: string): string => {
    return title
      .toLowerCase() // Convert to lowercase
      .trim() // Remove whitespace from both ends
      .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric characters except spaces
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with a single one
  };
  