import {DialogContent, TextField} from "@mui/material";
import {collection, doc} from "firebase/firestore";
import React, {useMemo, useState} from "react";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import {db} from "./App";

function ProfileNameInput({inputRef, onNameSubmit, defaultValue = ""}) {
  const [error, setError] = useState("");
  const [playerInfo] = useDocumentData(doc(db, "cache", "playerInfo"));
  const [value, setValue] = useState(defaultValue);
  const takenNames = useMemo(
    () => playerInfo?.takenNames.map((n) => n.toLowerCase()) || [],
    [playerInfo]
  );

  const validate = (value) => {
    const errorMessage =
      value.length < 3
        ? "That name is too short"
        : value.length > 8
        ? "That name is too long"
        : takenNames.includes(value.toLowerCase())
        ? "That name is already taken"
        : "";
    setError(errorMessage);
    return errorMessage === "";
  };

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (validate(value)) onNameSubmit(value);
        }}>
        <TextField
          onChange={(e) => {
            setValue(e.target.value.trim());
            validate(e.target.value.trim());
          }}
          error={!!error}
          value={value}
          color="text"
          helperText={error}
          className={error ? "shakeAnimation" : ""}
          inputRef={inputRef} //this is for a workaround because autofocus is broken
          autoFocus
          margin="dense"
          id="nameInput"
          label="Name"
          fullWidth
          variant="standard"></TextField>
      </form>
    </DialogContent>
  );
}

export default ProfileNameInput;
