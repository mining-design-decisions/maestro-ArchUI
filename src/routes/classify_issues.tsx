import React, { useEffect, useState } from "react";

function IssueTable(uiData) {
  return (
    <table className="table-auto">
      {uiData.map((item) => {
        return (
          <tr>
            <td>{item["issue_id"]}</td>
            <td>{item["issue_key"]}</td>
            <td>{item["manual_label"]}</td>
          </tr>
        );
      })}
    </table>
  );
}

function OverView() {
  let [uiData, setUiData] = useState(undefined);
  function fetchUiData() {
    let request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { tags: "Apache-SVN" },
        sort: null,
        sort_ascending: true,
        models: [],
        page: 1,
        limit: 10,
      }),
    };
    fetch("https://localhost:8000/ui", request)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  }
  useEffect(() => {
    fetchUiData();
  }, []);

  return <>{uiData === undefined ? "" : <IssueTable uiData={uiData} />}</>;
}

export default function ClassifyIssues() {
  return (
    <>
      <OverView />
    </>
  );
}
