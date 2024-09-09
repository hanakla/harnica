import { ModalManager, MordredOut } from "@fleur/mordred";
import { AppProps } from "next/app";
import Head from "next/head";
import { ModalBackdrop } from "@/components/ModalBackdrop";
import "./globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Component {...pageProps} />

      <MordredOut>{({ children }) => children}</MordredOut>
    </>
  );
}

export default MyApp;
