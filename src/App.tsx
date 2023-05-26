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
  if (formState.name === '') {
    tempErrors.push(`名前を入力してください。`);
  }
  if (formState.gender === '') {
    tempErrors.push(`性別を選択してください。`);
  }
  if (formState.affiliation === '') {
    tempErrors.push(`所属を選択してください。`);
  }
  if (formState.breakfastPreference === '') {
    tempErrors.push(`朝食の選択をしてください。`);
  }

  setErrors(tempErrors);

  // Send the form data to LINE bot via LIFF
  if(tempErrors.length === 0 && liff.isLoggedIn()) {
    try {
      let message = [
        `名前: ${formState.name}`,
        `性別: ${formState.gender}`,
        `所属: ${formState.affiliation}`,
        formState.clubName ? `単会名: ${formState.clubName}` : '',
        formState.source ? `どのように知りましたか: ${formState.source}` : '',
        formState.phoneNumber ? `電話番号: ${formState.phoneNumber}` : '',
        `朝食は必要ですか: ${formState.breakfastPreference}`
      ].filter(item => item !== '').join('\n');
      
      await liff.sendMessages([{
        type: 'text',
        text: "フォーム初回登録\n" + message
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
            <FormControl required fullWidth>
            <Select name="gender" value={formState.gender} onChange={handleSelectInputChange}>
                <MenuItem value="">--選択してください--</MenuItem>
                <MenuItem value="男性">男性</MenuItem>
                <MenuItem value="女性">女性</MenuItem>
                <MenuItem value="その他">その他</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" component="div">所属</Typography>
            <FormControl required fullWidth>
              <Select name="affiliation" onChange={handleSelectInputChange}>
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
              <TextField name="clubName" onChange={handleTextInputChange} fullWidth />
            </Grid>
          )}
  
          {formState.affiliation === "ゲスト" && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" component="div">当会を知ったきっかけ</Typography>
                <TextField name="source" onChange={handleTextInputChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" component="div">電話番号</Typography>
                <TextField name="phoneNumber" onChange={handleTextInputChange} fullWidth />
              </Grid>
            </>
          )}
  
          <Grid item xs={12}>
            <Typography variant="h6" component="div">朝食は必要ですか?</Typography>
            <FormControl component="fieldset">
              <RadioGroup aria-label="breakfastPreference" name="breakfastPreference" value={formState.breakfastPreference} onChange={handleTextInputChange}>
                <FormControlLabel value="はい" control={<Radio />} label="はい" />
                <FormControlLabel value="いいえ" control={<Radio />} label="いいえ" />
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
