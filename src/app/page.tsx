'use client';
import styles from './page.module.css';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const inputValueRef = useRef<HTMLInputElement>(null);
  const [showOutput, setShowOutput] = useState();
  const [error, setError] = useState('');
  const [datasetURL, setDatasetURL] = useState<[any]>([{}]);

  const getUserData = async () => {
    try {
      const data = await axios.get(
        'https://api.airtable.com/v0/appUZxzENSgRJhEiK/dataset_generated?view=Grid%20view',
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      );
      return await data.data.records;
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getDatasetURLS = async () => {
    try {
      const data = await axios.get(
        'https://api.airtable.com/v0/appUZxzENSgRJhEiK/datasets?view=Grid%20view',
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      );
      setDatasetURL(await data.data.records);
      return await data.data.records;
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getPrevData = async (value: string) => {
    const prevData = await getUserData();
    if (
      prevData.some(
        (obj: any) => obj.fields.regno.toLowerCase() === value.toLowerCase()
      )
    ) {
      return prevData.find(
        (obj: any) => obj.fields.regno.toLowerCase() === value.toLowerCase()
      );
    }
    return [];
  };

  const randomizer = () => {
    const randomIndex = Math.floor(Math.random() * datasetURL.length);
    const randomURL = datasetURL?.[randomIndex];
    return datasetURL?.[randomIndex];
  };

  const randomGenerator = async (url: string | undefined) => {
    if (url !== randomizer()?.fields.links) {
      console.log(randomizer()?.fields.links);
      return randomizer()?.fields.links;
    } else {
      randomGenerator(url);
    }
  };

  useEffect(() => {
    (async () => {
      console.log(await getUserData());
      console.log(await getDatasetURLS());
    })();
  }, []);

  const submitNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValueRef.current && inputValueRef.current.value !== '') {
      const registerNumber = Number(
        inputValueRef.current.value.match(/^(.*)(\d{2})$/)?.[2]
      );
      const stringPart = inputValueRef.current.value.match(/^(.*)(\d{2})$/)?.[1]
        ? inputValueRef.current.value.match(/^(.*)(\d{2})$/)?.[1]
        : '';
      const inputValue = inputValueRef.current.value;
      if (stringPart) {
        (async () => {
          const prevData = await getPrevData(
            stringPart.concat((registerNumber - 1).toString())
          );
          const body = {
            records: [
              {
                fields: {
                  regno: inputValue,
                  dataset_url: await randomGenerator(
                    prevData.length > 0 ? prevData[0].fields.dataset_url : ''
                  ),
                },
              },
            ],
          };
          (async () => {
            try {
              const prevData = inputValueRef.current?.value
                ? await getPrevData(inputValueRef.current?.value)
                : [];
              if (prevData.length !== 0 && prevData !== undefined) {
                throw new Error('Register number already present!');
              }
              const data = await axios.post(
                'https://api.airtable.com/v0/appUZxzENSgRJhEiK/dataset_generated',
                body,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
                  },
                }
              );
              if (data.status === 200) {
                setShowOutput(data.data.records[0].fields.dataset_url);
              }
            } catch (error: any) {
              setError(error.message);
            }
          })();
        })();
      }
    }
    return;
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Dataset Generator</h1>
      </header>
      <div className={styles.container}>
        <div className={styles.guidelines}>
          <ol>
            <li>Wait for the website to completely load.</li>
            <li>
              After you have entered your register number wait for the website
              to load your dataset.
            </li>
            <li>
              Remember you cant enter your register number again. Whatever
              dataset you got is final !
            </li>
            <li>
              The folder contains one excel file (for analysis) and one pdf file
              that contains questions. Download both and start your analysis.
            </li>
          </ol>
        </div>
        <form className={styles.center} onSubmit={submitNumber}>
          <input
            className={styles.input}
            type='text'
            placeholder='Enter your register number'
            ref={inputValueRef}
            minLength={8}
            maxLength={10}
            required
          />
          <button type='submit' className={styles.button}>
            Generate
          </button>
        </form>
        {showOutput ? (
          <div className={styles.output}>
            <h2>Your download link:-</h2>
            <Link href={showOutput} target='_blank'>
              {showOutput}
            </Link>
          </div>
        ) : null}
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <footer className={styles.footer}>
        <span>
          Made by{' '}
          <Link href='https://github.com/SyedHammad06' target='_blank'>
            Syed Hammad
          </Link>
          . Credits{' '}
          <Link href='https://www.linkedin.com/in/sasi-kiran/' target='_blank'>
            Sasi Kiran
          </Link>
        </span>
      </footer>
    </main>
  );
}
