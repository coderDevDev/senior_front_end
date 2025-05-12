import app from "@/app";
import { environmentConfig } from "@/config";


export const startServer = () => {
  try {
    const PORT: number = parseInt(`${environmentConfig.PORT}`, 10) || 8667;


    app.listen(PORT, () => {
      console.log(
        `Server is running at http://localhost:${PORT}`.bg_green.green
      );
    });

  } catch (err) {
    console.error(`[startUpServer]: ${err}`)
    process.exit(1)
  }
}

startServer();

export default app;
