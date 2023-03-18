import { useEffect } from "react";
import { fetchConfig, readLocalConfig } from "../lib/utils";
import { Config } from "../types/config";

// Components
import Head from "next/head";
import Footer from "../components/footer/Footer";
import Container from "../components/content/Container";
import Paper from "../components/content/Paper";
import Title from "../components/header/Title";
import PaperBody from "../components/content/PaperBody";
import BlockList from "../components/content/BlockList";
import Logo from "../components/header/Logo";

// Types
import { Block } from "../types/block";

// Google Tag manager
import TagManager from "react-gtm-module";
interface HomeProps {
  config: Config;
  error?: string | null;
}

export default function Home({ config, error }: HomeProps) {
  // Google Tag Manager
  useEffect(() => {
    if (!config.html.google_analytics) {
      return;
    }
    TagManager.initialize({
      gtmId: config.html.google_analytics,
    });
  }, [config.html.google_analytics]);

  const { blocks, html, main } = config;
  return (
    <div>
      <Head>
        <title>{html?.title}</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Container>
        <Paper>
          <Logo title={main.title} picture={main.picture} />
          <Title>{main?.title}</Title>
          <div className='divide-y divide-gray-300/50'>
            <PaperBody>
              <BlockList blocks={blocks as Block[]} />
            </PaperBody>
            <Footer>
              <p className='text-slate-400'>Copialo GRATIS!</p>
            </Footer>
            {error && <div>{error}</div>}
          </div>
        </Paper>
      </Container>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  let config: Config | null = null;
  let error = null;
  if (process.env.DOMAIN_MATCH) {
    try {
      const hostname = context.req.headers.host.split(".");
      const subdomain = hostname.shift();
      const domain = hostname.join(".");
      if (domain !== process.env.DOMAIN_MATCH) {
        throw new Error("Invalid DOMAIN_MATCH in .env");
      }
      const url = `https://raw.githubusercontent.com/${subdomain}/.hodl.ar/main/config.yml`;

      config = await fetchConfig(url);
    } catch (e: any) {
      console.warn("Invalid username or subdomain: " + e.message);
      error = e.message;
    }
  }

  if (!config) {
    config = await readLocalConfig();
  }

  return {
    props: { config, error },
  };
}
