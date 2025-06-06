
export const fetchWithRetry = async (queryFn: () => Promise<any>, maxRetries = 2): Promise<any> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      if (error.code === 'permission-denied' && attempt < maxRetries) {
        console.log(`🔄 Index: Permission denied, retrying... (attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
};
