import { useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.svg";
import { generateDoc } from "./generate";

/* math is hard */
const toCoordinates = (i: number): { xIndex: number; yIndex: number } => {
  switch (i) {
    case 0:
      return { xIndex: 0, yIndex: 0 };
    case 1:
      return { xIndex: 1, yIndex: 0 };
    case 2:
      return { xIndex: 0, yIndex: 1 };
    case 3:
      return { xIndex: 1, yIndex: 1 };
    case 4:
      return { xIndex: 0, yIndex: 2 };
    case 5:
      return { xIndex: 1, yIndex: 2 };
    default:
      throw new Error("unsupported index");
  }
};

function App() {
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [labels, setLabels] = useState<LabelParams[]>(
    [...Array(6)].map(() => ({
      title: "",
      subtitle: "",
      print: false,
    })),
  );

  const displayPDF = async () => {
    const doc = await generateDoc(
      labels
        .map((l, i) => ({
          ...l,
          ...toCoordinates(i),
        }))
        .filter((l) => l.print),
    );

    const pdfBytes = new Uint8Array(await doc.save());
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setFileData(url);
  };

  useEffect(() => {
    const onpress = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        setFileData(undefined);
      }
    };

    addEventListener("keydown", onpress);

    return () => {
      removeEventListener("keydown", onpress);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 mb-8 mt-2">
      {fileData && (
        <div className="relative z-50">
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm backdrop-brightness-75">
            <div className="w-4xl space-y-4 rounded-md p-4 bg-white">
              <div>
                <div className="float-right">
                  <button
                    className="px-2 py-1 bg-orange-700 text-white rounded-lg shadow-lg mb-2"
                    onClick={() => setFileData(undefined)}
                  >
                    done
                  </button>
                </div>
                <object
                  className="w-full h-[90vh]"
                  data={fileData}
                  type="application/pdf"
                >
                  <p>
                    Your browser does not support PDFs.{" "}
                    <a href={fileData}>Download the PDF</a>.
                  </p>
                </object>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mt-2">CHTL Name Tag Generator</h1>
            <h2>
              <i>name tags! get yer name tags here!!</i>
            </h2>
          </div>
          <button
            className="p-2 bg-blue-600 text-white rounded-lg shadow-lg"
            onClick={() => {
              displayPDF();
            }}
          >
            print!
          </button>
        </div>
        <div className="w-full border rounded-sm px-3 py-2 my-2 shadow-md">
          <p>
            <b>how to use?</b>
          </p>
          <ul className="list-disc [&>li]:ml-4">
            <li>this layout matches the actual sheet</li>
            <li>select the nametags you want to print</li>
            <li>enter your name, pronouns, etc.</li>
            <li>click "print" to make a PDF, and print it!</li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 border p-4 bg-neutral-200 shadow-lg">
        {labels.map((l, i) => (
          <LabelMaker
            key={i}
            label={l}
            setLabel={(newParams) => {
              setLabels((oldLabels) => {
                const newLabels = oldLabels.slice();
                newLabels[i] = {
                  ...oldLabels[i],
                  ...newParams,
                };
                return newLabels;
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

type LabelParams = {
  title: string;
  subtitle: string;
  print: boolean;
};

type UpdateLabelParams = (params: Partial<LabelParams>) => void;

const LabelMaker = ({
  label,
  setLabel,
}: {
  label: LabelParams;
  setLabel: UpdateLabelParams;
}) => {
  return (
    <div className="bg-white border p-4">
      <div className={`flex flex-col gap-2 ${!label.print && "opacity-30"}`}>
        <img src={logo} className="px-24 pb-4" />
        <input
          className="border rounded-sm p-1 text-center"
          placeholder="Sam Wolfson"
          value={label.title}
          onChange={(e) => setLabel({ title: e.target.value })}
        />
        <input
          className="border rounded-sm p-1 text-center"
          placeholder="he/him"
          value={label.subtitle}
          onChange={(e) => setLabel({ subtitle: e.target.value })}
        />
      </div>
      <label className="flex gap-2 mt-2 opacity-100">
        <input
          type="checkbox"
          checked={label.print}
          onChange={() => {
            setLabel({ print: !label.print });
          }}
        />
        <span>print this nametag</span>
      </label>
    </div>
  );
};

export default App;

/*
 *
        <object ref={pdf}></object>
        */
