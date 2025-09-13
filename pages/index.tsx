import React, { useState } from 'react';
import Head from 'next/head';
import WaterfallGallery from '../components/WaterfallGallery';

export default function Home() {
  const [columns, setColumns] = useState(3);

  return (
    <>
      <Head>
        <title>相册 - 瀑布流展示</title>
        <meta name="description" content="使用瀑布流布局展示相册图片" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <WaterfallGallery columns={columns} />
    </>
  );
}
