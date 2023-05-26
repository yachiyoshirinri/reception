import React, { useEffect, useState, ChangeEvent } from "react";
import { Box, Button, Container, FormControl, FormControlLabel, FormLabel, InputLabel, ListItem, List, MenuItem, Radio, RadioGroup, Select, TextField, Grid, Typography } from "@mui/material";
import liff from "@line/liff";
import "./App.css";
import { SelectChangeEvent } from '@mui/material/Select';

interface FormState {
  name: string;
  gender: string;
  affiliation: string;
  clubName: string;
  source: string;
  phoneNumber: string;
  breakfastPreference: string;
}

const App = () => {
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    liff
      .init({
        liffId: import.meta.env.VITE_LIFF_ID
      })
      .then(() => {
        setMessage("LIFFの初期化が成功しました。");
      })
      .catch((e: Error) => {
        setMessage("LIFFの初期化が失敗しました。");
        setErrors(errors => [...errors, `${e}`]);
      });
  }, []);

  const [formState, setFormState] = useState<FormState>({
    name: '',
    gender: '',
    affiliation: '',
    clubName: '',
    source: '',
    phoneNumber: '',
    breakfastPreference: ''
  });

// This will be used for the TextField components
const handleTextInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const name = event.target.name;
  const value = event.target.value;

  if (typeof name === "string" && typeof value === "string") {
    setFormState({
      ...formState,
      [name]: value
    });
  }
};

// This will be used for the Select components
const handleSelectInputChange = (event: SelectChangeEvent<string>) => {
  const name = event.target.name;
  const value = event.target.value;

  if (typeof name === "string" && typeof value === "string") {
    setFormState({
      ...formState,
      [name]: value
    });
  }
};
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);  // Clear out previous errors

    // Input validation
    let tempErrors: string[] = [];
    for (let key in formState) {
      if (formState[key as keyof FormState] === '') {
        tempErrors.push(`${key} を入力してください。`);
      }
    }

    setErrors(tempErrors);

    // Send the form data to LINE bot via LIFF
    if(tempErrors.length === 0 && liff.isLoggedIn()) {
      try {
        await liff.sendMessages([{
          type: 'text',
          text: JSON.stringify(formState)
        }]);
        liff.closeWindow();
      } catch (err) {
        setErrors(errors => [...errors, 'フォームの送信中に問題が発生しました。もう一度試してください。']);
      }
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" component="div">名前</Typography>
            <TextField name="name" onChange={handleTextInputChange} required fullWidth />
          </Grid>
          <Grid item xs={12}>
          <Typography variant="h6" component="div">性別</Typography>
            <FormControl fullWidth>
            <Select name="gender" value={formState.gender} onChange={handleSelectInputChange} required>
                <MenuItem value="">--選択してください--</MenuItem>
                <MenuItem value="Male">男性</MenuItem>
                <MenuItem value="Female">女性</MenuItem>
                <MenuItem value="Other">その他</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" component="div">所属</Typography>
            <FormControl fullWidth>
              <Select name="affiliation" onChange={handleSelectInputChange} required>
                <MenuItem value="">--選択してください--</MenuItem>
                <MenuItem value="自単会">自単会</MenuItem>
                <MenuItem value="他単会">他単会</MenuItem>
                <MenuItem value="ゲスト">ゲスト</MenuItem>
              </Select>
            </FormControl>
          </Grid>
  
          {formState.affiliation === "他単会" && (
            <Grid item xs={12}>
              <Typography variant="h6" component="div">単会名</Typography>
              <TextField name="clubName" onChange={handleTextInputChange} required fullWidth />
            </Grid>
          )}
  
          {formState.affiliation === "ゲスト" && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" component="div">どのように知りましたか?</Typography>
                <TextField name="source" onChange={handleTextInputChange} required fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" component="div">電話番号</Typography>
                <TextField name="phoneNumber" onChange={handleTextInputChange} required fullWidth />
              </Grid>
            </>
          )}
  
          <Grid item xs={12}>
            <Typography variant="h6" component="div">朝食は必要ですか?</Typography>
            <FormControl component="fieldset" required>
              <RadioGroup aria-label="breakfastPreference" name="breakfastPreference" value={formState.breakfastPreference} onChange={handleTextInputChange}>
                <FormControlLabel value="Yes" control={<Radio />} label="はい" />
                <FormControlLabel value="No" control={<Radio />} label="いいえ" />
              </RadioGroup>
            </FormControl>
          </Grid>
  
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>送信</Button>
          </Grid>
        </Grid>
      </form>

      {errors.length > 0 && (
        <ul>
          {errors.map((error, index) => <li key={index}>{error}</li>)}
        </ul>
      )}
    </Container>
  );
};

export default App;

