import { useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "../assets/react.svg";
import "../App.css";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../libs/trpc";

export const HomePage = () => {
	const [count, setCount] = useState(0);

	const binListQuery = useQuery(trpc.listBins.queryOptions());

	return (
		<>
			{JSON.stringify(binListQuery.data)}
			<div>
				<a href="https://vite.dev" target="_blank" rel="noreferrer">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank" rel="noreferrer">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button type="button" onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
};
