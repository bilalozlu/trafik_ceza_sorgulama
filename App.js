import React, {Component} from 'react';
import {StyleSheet, Text, TextInput,
        View, ImageBackground, ScrollView,
        Dimensions, TouchableOpacity, Alert,
        AsyncStorage, Navigator, Image } from 'react-native';
import {createStackNavigator} from 'react-navigation';
import DateTimePicker from 'react-native-modal-datetime-picker';

export default class App extends Component<Props> {
  render() {
    return <NavigationApp />;
  }
}

/* Anasayfa (Giris sayfasi) */
class Page1 extends React.Component {
  static navigationOptions = {title:'Trafik Ceza Sorgulama',
  headerStyle: {backgroundColor: "rgb(240,240,240)"}, headerTitleStyle: {color:"rgb(36,30,36)"}};

  render() {
    const { navigate } = this.props.navigation;
    return (
      <ImageBackground source = {require ('./img/back.jpg')} style = {styles.container}>
      <TouchableOpacity activeOpacity={0.5} style = {styles.homebox} onPress = { this.checkPoint.bind(this) }>
          <Text style= {styles.hometext}>Araç Listesi</Text>
          <View style = {styles.icon}>
              <Text style = {styles.icontext}>≡</Text>
          </View>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.5} style = {styles.homebox} onPress = { () => navigate('P2') }>
          <Text style= {styles.hometext}>Yeni Araç Kaydı</Text>
          <View style = {styles.icon}>
              <Text style = {styles.icontext}>+</Text>
          </View>
      </TouchableOpacity>
      </ImageBackground>
    );
  }

/* Kayitli plaka olup olmadigi kontrol ediliyor */
  async checkPoint() {
    const { navigate } = this.props.navigation;
    try {
      let savedPlakas = await AsyncStorage.getItem('savedPlakas');
      if (savedPlakas.length>2) {
        navigate('P4');
      }
      else {
        Alert.alert('',"Kayıtlı araç bulunamadı.");
      }
    }
    catch(error) {
      Alert.alert('',"Kayıtlı araç bulunamadı.");
    }
  }
}

/* Plaka ekleme sayfasi */
class Page2 extends React.Component {
  static navigationOptions = {title:'Yeni Araç Kaydı',
  headerStyle: {backgroundColor: "rgb(240,240,240)"}, headerTitleStyle: {color:"rgb(36,30,36)"}};

  constructor(props) {
    super(props);
    this.state = {
      plakaNote: [],
      plakaNo : "",
      tcKimlik: "",
      vergiNo: "",
      tescilT: "Tescil tarihini giriniz",
      testData: null,
      load: false,
      sirket: false,
      exist: false,
      isVisible: false,
      submitDate: null
    };
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <ImageBackground style = {styles.container}
      source = {require ('./img/back.jpg')}>
      <View>
        <ScrollView keyboardShouldPersistTaps="handled">
        <View style= {styles.formbox}>
          <TextInput style= {styles.place}
          onChangeText = {(plakaNo) => this.setState({plakaNo})}
          value = {this.state.plakaNo}
          maxLength={11}
          onSubmitEditing={() => { this.second.focus(); }}
          placeholder= "Plakanızı giriniz"
          underlineColorAndroid='transparent'
          placeholderTextColor = "rgba(108,96,108,0.75)">
          </TextInput>

          <TouchableOpacity style={styles.check}
          onPress = { () => this.setState({ sirket: !this.state.sirket }) }
          activeOpacity={0.75}>
            <Image style={{width: 22, height: 22}}
            source={this.state.sirket ? require('./img/check.png') : require('./img/uncheck.png')}/>
            <Text style={styles.checktext}>Şirket aracı girmek istiyorum</Text>
          </TouchableOpacity>

          <TextInput style = {styles.place}
          onChangeText = {this.state.sirket ? (vergiNo) => this.setState({vergiNo}) : (tcKimlik) => this.setState({tcKimlik})}
          value = {this.state.sirket ? this.state.vergiNo : this.state.tcKimlik}
          maxLength={this.state.sirket ? 10 : 11}
          ref={(input) => { this.second = input; }}
          placeholder = {this.state.sirket ? "Vergi kimlik numaranızı giriniz" : "TC kimlik numaranızı giriniz"}
          keyboardType = "numeric"
          underlineColorAndroid='transparent'
          placeholderTextColor = "rgba(108,96,108,0.75)">
          </TextInput>

          <TouchableOpacity style= {styles.place}
          placeholder= "Tescil tarihini giriniz"
          onPress={ () => this.setState({ isVisible: true })}
          activeOpacity={0.75}>
            <Text style = {this.state.tescilT === "Tescil tarihini giriniz" ? {color:"rgba(108,96,108,0.75)"} : {color:"rgb(0,0,0)"}}>
              {this.state.tescilT}
            </Text>
          </TouchableOpacity>

          <DateTimePicker
          isVisible = {this.state.isVisible}
          onConfirm = { (date) => this.setState({
          tescilT: JSON.stringify(date).substring(1,11).split("-")[2] + "." +
          JSON.stringify(date).substring(1,11).split("-")[1] + "." +
          JSON.stringify(date).substring(1,11).split("-")[0],
          isVisible: false,
          submitDate : date})}
          date = {this.state.submitDate ?  this.state.submitDate : new Date()}
          onCancel = { () => this.setState({ isVisible: false })}/>
        </View>

        <TouchableOpacity style = {styles.okbox}
        activeOpacity={0.5}
        onPress = { this.addPlaka.bind(this) }>
          <Text style={styles.oktext}>Kaydet</Text>
          <View style = {styles.okicon}>
            <Text style = {styles.okicontext}>+</Text>
          </View>
        </TouchableOpacity>
        </ScrollView>
      </View>
      </ImageBackground>
    );
  }

/* Kaydete basildiktan sonra bu fonksiyon calisiyor, girilen plakayi kaydetme islemini baslatiyor */
  async addPlaka () {

    /* Girilen plakada bosluk varsa siliniyor */
    const pl = this.state.plakaNo.replace(/\s+/g, '').toUpperCase();

    /* Tescil tarihi parse ediliyor */
    const dt = this.state.tescilT.split(".");

    /* Eger sirket araci ise vergiNo, sahis araci ise TCkimlik aliniyor */
    let tc = "";
    let vn = "";
    if (this.state.sirket) {
      vn = this.state.vergiNo.replace(/\s+/g, '');
    }
    else {
      tc = this.state.tcKimlik.replace(/\s+/g, '');
    }

    /* Girilen bilgilerin eksik olup olmadigi kontrol ediliyor */
    if (pl === "") {
      Alert.alert('',"Lütfen aracınızın plakasını giriniz.");
    }
    else if (tc === "" && vn === "") {
      Alert.alert('',"Lütfen özel araçlar için T.C. kimlik numaranızı, şirket yada kurum araçları için vergi kimlik numaranızı giriniz.");
    }
    else if (dt[0] === "Tescil tarihini giriniz") {
      Alert.alert('',"Lütfen tescil tarihini giriniz.");
    }
    else if (tc.length < 11 && vn.length < 10) {
      Alert.alert('',"Girdiğiniz bilgilere sahip araç bulunamadı, lütfen bilgilerinizi kontrol edip tekrar deneyiniz.");
    }

    /* Girilen bilgilerin içinde non-word karakter olup olmadigi kontrol ediliyor */
    else if (pl.search(/\W/) !== -1 || tc.search(/\W/) !== -1 || vn.search(/\W/) !== -1) {
      Alert.alert('',"Girdiğiniz bilgilere sahip araç bulunamadı, lütfen bilgilerinizi kontrol edip tekrar deneyiniz.");
    }

    /* Plaka sorgulaniyor, bağlantı yoksa hata veriyor */
    else {
      fetch('http://www.cezalarim.com:49714/api/Arac/getAracDurumu/plaka='+pl+'@ozelPlaka=0@tckimlikno='+
      tc+'@vergikimlikno='+vn+'@tesciltarihigun='+dt[0]+'@tesciltarihiay='+dt[1]+'@tesciltarihiyil='+dt[2])
      .then(response => { response.json().then(response => {
      this.setState({testData:response, load:true, plakaNo:pl, tcKimlik:tc, vergiNo:vn})})})
      .catch( error => {Alert.alert('',"Lütfen internet bağlantınızı kontrol ediniz.")});

    /* Daha onceden kaydedilmis olan plakalar alinip plakaNote variable'ina kaydediliyor */
      try {
        let previousPlakas = await AsyncStorage.getItem('savedPlakas');
        let parsed = JSON.parse(previousPlakas);
        if (parsed !== null ) {
        this.setState({ plakaNote: parsed});
        }
      }
      catch(error) {
        this.setState({ plakaNote: []});
      }

    /* 3'den fazla arac kaydi varsa, yeni kayit yapilmiyor.
      !!! BURASI UCRETLI VERSIYONDA KALDIRILACAK !!! */
      if (this.state.plakaNote.length>=3){
        this.setState({exist:true});
      }

    /* Bu plaka daha once kaydedilmisse, yeni kayit yapılmıyor */
      for (let k=0; k<this.state.plakaNote.length; k++){
          if (this.state.plakaNote[k].plakaNo === pl){
              this.setState({exist:true});
          }}

      setTimeout(this.addPlaka2.bind(this),60);
    }
  }

  /* Fetch isleminin gerceklesip gerceklesmedigi 120ms de bir kontrol ediliyor */
  addPlaka2 () {
      setTimeout(this.addPlaka3.bind(this),60);
  }

  /* Fetch bitince, yeni girilen plaka bu fonksiyonda sorgulanip kaydediliyor */
  async addPlaka3 () {
    const { navigate } = this.props.navigation;

    /* Fetch islemi bittiyse plaka sorgulaniyor */
    if (this.state.load) {

      /* Hatali bilgi girildiyse hata veriliyor, plaka kaydedilmiyor */
      if (this.state.testData["Message"]==="An error has occurred.") {
        this.setState({ testData: null, load: false});
        Alert.alert('',"Girdiğiniz bilgilere sahip araç bulunamadı, lütfen bilgilerinizi kontrol edip tekrar deneyiniz.");
      }
      else {

        /* Girilen yeni plaka, kayitli plakalara ekleniyor */
        if (this.state.exist === false) {
          this.state.plakaNote.push({
            'plakaNo' :this.state.plakaNo,
            'tcKimlik' :this.state.tcKimlik,
            'tescilT' :this.state.tescilT,
            'vergiNo' :this.state.vergiNo,
            'marka' : this.state.testData["Marka"],
            'tip' : this.state.testData["Tip"]
          });
          AsyncStorage.setItem('savedPlakas', JSON.stringify(this.state.plakaNote));
        }
        const pl = this.state.plakaNo;
        const tc = this.state.tcKimlik;
        const vn = this.state.vergiNo;
        const dt = this.state.tescilT;
        this.setState({
          plakaNo : "",
          tcKimlik: "",
          vergiNo: "",
          tescilT: "Tescil tarihini giriniz",
          testData: null,
          load: false,
          sirket:false,
          exist: false,
          submitDate: null});

        /* Yeni kaydedilen plaka sorgulaniyor */
        this.props.navigation.navigate('P3',{
          plakaNo: pl,
          tcKimlik: tc,
          vergiNo: vn,
          tescilT: dt});
      }
    }
    else {
      setTimeout(this.addPlaka2.bind(this),60);
    }
  }
}

/* Kayitli plakalarin liste halinde gosterilmesi */
class Plaka extends React.Component {
  render() {
    return (
      <View key ={this.props.keyval} style={styles.plakas}>
      <TouchableOpacity activeOpacity={0.75} onPress={this.props.showMethod}>
          <Text style={styles.plakano}>{this.props.val.plakaNo}</Text>
          <Text style={styles.marka}>{this.props.val.marka} {this.props.val.tip}</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.5} onPress = {this.props.deleteMethod} style= {styles.delicon}>
          <Text style= {styles.delicontext}>🗑</Text>
      </TouchableOpacity>
      </View>
    );
  }
}

/* Kayitli trafik cezalarinin liste halinde gosterilmesi */
class Ceza1 extends React.Component {
  render() {
    return (
      <View key ={this.props.keyval} style={styles.cezas}>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={[styles.cezatext, {marginTop:1}]}> Vergi Türü</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={[styles.cezatext, {marginTop:1}]}>: {this.props.val.vergiTuru}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Tutanak Tarihi</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.tutanakTarihi}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Tebliğ Tarihi</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.tebligTarihi}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Seri Sıra No</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.seriSiraNo}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Tahakkuk Fiş No</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.tahakkukFisNo}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Ceza Tutarı</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.cezaTutari}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Kat/Ceza/Faiz</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.katCezaFaiz}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={[styles.cezatext, {fontWeight: "bold"}]}> Toplam Ceza</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={[styles.cezatext, {fontWeight: "bold"}]}>: {this.props.val.toplamCeza}</Text>
          </View>
        </View>
      </View>
    );
  }
}

/* Kayitli MTV cezalarinin liste halinde gosterilmesi */
class Ceza2 extends React.Component {
  render() {
    return (
      <View key ={this.props.keyval} style={styles.cezas}>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={[styles.cezatext, {marginTop:1}]}> Vergi Türü</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={[styles.cezatext, {marginTop:1}]}>: {this.props.val.vergiTuru}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Vade Tarihi</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.vadeTarihi}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Dönem</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.donem}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Taksit</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.taksit}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Tahakkuk</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.tahakkuk}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Borç</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.borc}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Gecikme Zammı</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.gecikmeZammi}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={styles.cezatext}> Ödenen Miktar</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={styles.cezatext}>: {this.props.val.odenenMiktar}</Text>
          </View>
        </View>
        <View style={{flexDirection: "row"}}>
          <View style={{width:123}}>
            <Text style={[styles.cezatext, {fontWeight: "bold"}]}> Toplam Borç</Text>
          </View>
          <View style={{width: wid*0.95-132}}>
            <Text style={[styles.cezatext, {fontWeight: "bold"}]}>: {this.props.val.toplamBorc}</Text>
          </View>
        </View>
      </View>
    );
  }
}

/* Cezalar sayfasi */
class Page3 extends React.Component {
  static navigationOptions = ({ navigation }) => ({title:`Cezalar (${navigation.state.params.plakaNo})`,
  headerStyle: {backgroundColor: "rgb(240,240,240)"}, headerTitleStyle: {color:"rgb(36,30,36)"}});

  constructor() {
    super();
    this.state = {
      theData: null,
      isload: false,
      cezalar1: [],
      cezalar2: []};
  }

  componentDidMount(){
    const { navigation } = this.props;
    const { navigate } = this.props.navigation;
    const plakaNo = navigation.state.params.plakaNo;
    const tcKimlik = navigation.state.params.tcKimlik;
    const tescilT = navigation.state.params.tescilT;
    const vergiNo = navigation.state.params.vergiNo;
    const dt = tescilT.split(".");

    return fetch('http://www.cezalarim.com:49714/api/Arac/getAracDurumu/plaka='+plakaNo+'@ozelPlaka=0@tckimlikno='+
    tcKimlik+'@vergikimlikno='+vergiNo+'@tesciltarihigun='+dt[0]+'@tesciltarihiay='+dt[1]+'@tesciltarihiyil='+dt[2])
    .then(response => { response.json().then(response => { this.setState({theData:response, isload:true})})})
    .catch( error => {Alert.alert('',"Lütfen internet bağlantınızı kontrol ediniz.", [{text: 'OK', onPress: () => navigate('P4')}])});
  }

  render() {

    /* Herhangi bir ceza olmamasi durumu */
    if (this.state.isload && this.state.theData['TrafikCezaBilgisiCount']+this.state.theData['MtvBilgisiCount'] === 0){
      return(
        <ImageBackground source = {require ('./img/back.jpg')} style = {styles.container}>
          <View style={styles.cezas}>
            <Text style={styles.nocezatext}> Trafik Cezası borcunuz ve </Text>
            <Text style={styles.nocezatext}> Motorlu Taşıtlar Vergisi borcunuz </Text>
            <Text style={styles.nocezatext}> bulunmamaktadır. </Text>
          </View>
        </ImageBackground>
      );
    }

    /* Plakanin kaldirilmis olmasi, aracin hurdaya cikmasi vs. durumu */
    else if (this.state.isload && this.state.theData["Message"]==="An error has occurred."){
      return(
        <ImageBackground source = {require ('./img/back.jpg')} style = {styles.container}>
          <View style={styles.cezas}>
            <Text style={styles.nocezatext}> Bu bilgilere sahip araç bulunamadı, </Text>
            <Text style={styles.nocezatext}> lütfen bilgilerinizi kontrol edip </Text>
            <Text style={styles.nocezatext}> tekrar deneyiniz. </Text>
          </View>
        </ImageBackground>
      );
    }

    /* Cezalarin gosterilmesi */
    else if(this.state.isload){
        for (let n=0;n<this.state.theData['TrafikCezaBilgisiCount'];n++){
          this.state.cezalar1.push({
            'cezaTutari' :this.state.theData["TrafikCezaBilgileri"][n]['cezaTutari'],
            'katCezaFaiz' :this.state.theData["TrafikCezaBilgileri"][n]['katCezaFaiz'],
            'seriSiraNo' :this.state.theData["TrafikCezaBilgileri"][n]['seriSiraNo'],
            'tahakkukFisNo' :this.state.theData["TrafikCezaBilgileri"][n]['tahakkukFisNo'],
            'tebligTarihi' :this.state.theData["TrafikCezaBilgileri"][n]['tebligTarihi'],
            'toplamCeza' :this.state.theData["TrafikCezaBilgileri"][n]['toplamCeza'],
            'tutanakTarihi' :this.state.theData["TrafikCezaBilgileri"][n]['tutanakTarihi'],
            'vergiTuru' :this.state.theData["TrafikCezaBilgileri"][n]['vergiTuru'],
          });
        }
        for (let n=0;n<this.state.theData['MtvBilgisiCount'];n++){
          this.state.cezalar2.push({
            'borc' :this.state.theData["MtvBilgileri"][n]['borc'],
            'donem' :this.state.theData["MtvBilgileri"][n]['donem'],
            'gecikmeZammi' :this.state.theData["MtvBilgileri"][n]['gecikmeZammi'],
            'odenenMiktar' :this.state.theData["MtvBilgileri"][n]['odenenMiktar'],
            'tahakkuk' :this.state.theData["MtvBilgileri"][n]['tahakkuk'],
            'taksit' :this.state.theData["MtvBilgileri"][n]['taksit'],
            'toplamBorc' :this.state.theData["MtvBilgileri"][n]['toplamBorc'],
            'vadeTarihi' :this.state.theData["MtvBilgileri"][n]['vadeTarihi'],
            'vergiTuru' :this.state.theData["MtvBilgileri"][n]['vergiTuru'],
          });
        }

        let cezas1 = this.state.cezalar1.map((val,key) => {
          return <Ceza1 key = {key} keyval={key} val={val}/>});
        let cezas2 = this.state.cezalar2.map((val,key) => {
            return <Ceza2 key = {key} keyval={key} val={val}/>});

        return (
          <ImageBackground source = {require ('./img/back.jpg')} style = {styles.container}>
            <View>
              <ScrollView>
                {cezas1}
                {cezas2}
              </ScrollView>
            </View>
          </ImageBackground>
        );
    }

    /* Fetch isleminin devam etmesi */
    else if (this.state.isload === false){
      return(
        <ImageBackground source = {require ('./img/back.jpg')} style = {styles.container}>
          <View>
            <Text style={styles.icontext}>Yükleniyor...</Text>
          </View>
        </ImageBackground>
      );
    }
  }
}

/* Arac listesi sayfasi */
class Page4 extends React.Component {
  static navigationOptions = {title:'Araç Listesi',
  headerStyle: {backgroundColor: "rgb(240,240,240)"}, headerTitleStyle: {color:"rgb(36,30,36)"}};

  constructor() {
    super();
    this.state = {plakaList: []};
  }

  componentDidMount() {
    this.getPlaka().done();
  }
  async getPlaka() {
    let savedPlakas = await AsyncStorage.getItem('savedPlakas');
    this.setState({plakaList: JSON.parse(savedPlakas)});
  }

  /* Arac kaydinin silinmesi */
  deletePlaka(key) {
    Alert.alert('',"Kaydı silmek istediğinize emin misiniz?", [
      {text: 'Evet', onPress: () => this.performDelete(key)},
      {text: 'Hayır', onPress: () => {}}
    ]);
  }
  performDelete(key) {
    this.state.plakaList.splice(key,1);
    this.setState({plakaList: this.state.plakaList});
    AsyncStorage.setItem('savedPlakas', JSON.stringify(this.state.plakaList));
  }

  /* Araca ait cezalarin gosterilmesi */
  showPlaka(key){
    this.props.navigation.navigate('P3',{
      plakaNo: this.state.plakaList[key].plakaNo,
      tcKimlik: this.state.plakaList[key].tcKimlik,
      vergiNo: this.state.plakaList[key].vergiNo,
      tescilT: this.state.plakaList[key].tescilT});
  }

  render() {
    let plakas = this.state.plakaList.map((val,key) => {
        return <Plaka key = {key} keyval={key} val={val}
          deleteMethod = { ()=> this.deletePlaka(key)}
          showMethod = { ()=> this.showPlaka(key)}/>}
        );
    return (
      <ImageBackground source = {require ('./img/back.jpg')} style = {styles.container}>
        <View>
          <ScrollView>
            {plakas}
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }
}

const NavigationApp = createStackNavigator({
  Home: { screen: Page1},
  P2: { screen: Page2 },
  P3: { screen: Page3 },
  P4: { screen: Page4 }
});

/* Ekran boyutu (en) */
const wid = Dimensions.get('window').height > Dimensions.get('window').width ? Dimensions.get('window').width : Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  homebox: {
    height: 60,
    width: wid*0.75,
    marginBottom: 20,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 3,
    borderWidth: 3,
    borderColor: "rgba(240,240,240,0.7)",
    justifyContent: 'center',
    backgroundColor: "rgba(240,240,240,0.95)"
  },
  hometext: {
    fontSize: 20,
    left: 10,
    color: 'rgb(36,30,36)',
    fontWeight: "bold"
  },
  icon: {
    backgroundColor: "rgb(36,30,36)",
    height: 30,
    width:30,
    position: "absolute",
    right: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icontext: {
    fontSize: 20,
    fontWeight: "bold",
    color: 'rgb(240,240,240)'
  },
  formbox: {
    width: wid,
    backgroundColor: "rgba(240,240,240,0.95)"
  },
  place: {
    backgroundColor: "rgb(255,255,255)",
    width: wid*0.95,
    marginLeft: wid*0.025,
    height: 48,
    paddingLeft: 3,
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  okbox: {
    height: 40,
    width: wid*0.4,
    marginTop: 10,
    borderRadius: 3,
    borderWidth: 3,
    borderColor: "rgba(240,240,240,0.7)",
    backgroundColor: "rgba(240,240,240,0.95)",
    justifyContent: 'center',
    left: wid*0.6-6
  },
  oktext:  {
    fontSize: 18,
    left: 8,
    color: 'rgb(36,30,36)',
    fontWeight: "bold"
  },
  okicon: {
    backgroundColor: "rgb(36,30,36)",
    height: 20,
    width:20,
    position: "absolute",
    right: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  okicontext: {
    fontSize: 16,
    fontWeight: "bold",
    color: 'rgb(240,240,240)'
  },
  plakas: {
    minHeight: 90,
    width: wid*0.95,
    justifyContent: "center",
    margin: 10,
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "rgba(240,240,240,0.7)",
    backgroundColor: "rgba(240,240,240,0.95)"
  },
  plakano: {
    fontSize: 20,
    left: 20,
    color: 'rgb(36,30,36)',
    fontWeight: "bold",
    marginBottom: 10
  },
  marka: {
    fontSize: 15,
    color: "rgb(36,30,36)",
    left: 20,
    maxWidth: wid*0.95 - 72
  },
  delicon: {
    backgroundColor: "rgb(36,30,36)",
    height: 36,
    width:36,
    position: "absolute",
    right: 12,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  delicontext: {
    fontSize: 20,
    fontWeight: "bold",
    color: 'rgb(240,240,240)'
  },
  cezas: {
    minHeight: 90,
    width: wid*0.95,
    justifyContent: "center",
    margin: 10,
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "rgba(240,240,240,0.7)",
    backgroundColor: "rgba(240,240,240,0.95)"
  },
  cezatext: {
    fontSize: 16,
    left: 3,
    color: 'rgb(36,30,36)'
  },
  nocezatext: {
    fontSize: 18,
    left: 3,
    alignItems: "center",
    color: 'rgb(36,30,36)',
    fontWeight: "bold"
  },
  check: {
    width: wid*0.75,
    marginLeft: wid*0.027,
    height:22
  },
  checktext: {
    position: "absolute",
    left: 25,
    color:"rgba(108,96,108,0.75)"
  }
});
