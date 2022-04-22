import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Genesis from "./artifacts/contracts/GenesisTopStars.sol/GenesisTopStars.json";
import Swal from "sweetalert2";

const genesisAddressContract = "0x648715D07eAa631233EbB6b039be5FC8a1e5cD61"; // testnet

function App() {
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("no-net");
  const [amount, setAmount] = useState("");
  const [mint, setMint] = useState(0);
  const BINANCENETWORK = "bnbt"; // Testnet
  //const BINANCENETWORK = 'bnb';

  useEffect(function () {
    if (typeof window.ethereum === "undefined") {
      console.log("Metamask no existe en este navegador");

      Swal.fire({
        title: "Sin Metamask",
        text: "Tendrá que instalarse una billetera",
        showCancelButton: true,
        confirmButtonText: "instalar metamask",
        imageUrl: "./img/metamask-transparent.png",
        // imageWidth: 600,
        // imageHeight: 150,
        imageAlt: "instalando metamask",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          window.open(
            "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
            "_blank"
          );
        }
      });
    } else {
      isInNetwork();
      changeAccounts();
      changeNetwork();
    }
  }, []);

  //===========================================================================================
  async function addNetwork() {
    let networkData = [
      {
        chainId: "0x61",
        chainName: "BSCTESTNET",
        rpcUrls: ["https://data-seed-prebsc-2-s3.binance.org:8545"],
        nativeCurrency: {
          name: "BINANCE COIN",
          symbol: "BNB",
          decimals: 18,
        },
        blockExplorerUrls: ["https://testnet.bscscan.com/"],
      },
    ];

    // let networkData = [{
    //     chainId: "0x38",
    //     chainName: "BSCMAINET",
    //     rpcUrls: ["https://bsc-dataseed1.binance.org"],
    //     nativeCurrency: {
    //       name: "BINANCE COIN",
    //       symbol: "BNB",
    //       decimals: 18,
    //     },
    //     blockExplorerUrls: ["https://testnet.bscscan.com/"],
    //   },
    // ];

    // agregar red o cambiar red
    return window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: networkData,
    });
  }

  //===========================================================================================
  function isInNetwork() {
    if (network !== BINANCENETWORK && network !== "no-net") {
      Swal.fire({
        title: "red",
        text:
          "Estás en la red " +
          network +
          ", has de cambiar a la red " +
          BINANCENETWORK,
        confirmButtonText: "Cambiar o instalar red BNB",
        imageUrl: "https://cryptodaily.io/wp-content/uploads/2021/07/p-2.png",
        imageWidth: 300,

        imageAlt: "Red Binance Smart Chain",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          addNetwork();
        } else {
          setNetwork(network);
          console.log("red: ", network);
        }
      });
    } else {
    }
  }

  useEffect(() => {
    isInNetwork();
  }, [network]);

  useEffect(() => {
    changeAccounts();
  }, [account]);

  async function accountFromMetamask(accountUser) {
    console.log("funcion balancesMetamask");
    let cuentaUsuario = accountUser.toString();
    let subini = cuentaUsuario.substr(0, 4);
    let subfinal = cuentaUsuario.substr(-4, 4);
    document.querySelector("#wallet").innerHTML = `${subini} ... ${subfinal}`;
  }

  async function conectionMetamask() {
    console.log("el usuario a conectado su metamask");

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const network = await provider.getNetwork();
    console.log("network en conection metamask", network.name);
    setNetwork(network.name);

    const signer = provider.getSigner(); // user
    const accountUser = await signer.getAddress();
    console.log(accountUser);
    setAccount(accountUser);
    await accountFromMetamask(accountUser);
    await createContractConnection(accountUser, provider);
  }

  // funcion que detecta los cambios de cuenta
  async function changeAccounts() {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", async function () {
        await conectionMetamask();
      });
    }
  }

  // funcion que detecta los cambios de red
  async function changeNetwork() {
    if (typeof window.ethereum !== "undefined") {
      // detect Network account change
      window.ethereum.on("chainChanged", async function (networkId) {
        console.log("cambio de red efectuado..", networkId);
        await conectionMetamask();
      });
    }
  }

  async function createContractConnection(accountUser, provider) {
    const contract = new ethers.Contract(
      genesisAddressContract,
      Genesis.abi,
      provider
    );

    await balanceUser(accountUser, contract);

    await minter(contract);
  }

  async function minter(contract) {
    //Times for claim
    try {
      const minterNumber = await contract.soldGenesis();
      console.log("minteados: ", minterNumber.toString());
      setMint(minterNumber.toString());
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  async function balanceUser(accountUser, contract) {
    try {
      const amountFromContract = await contract.balanceOf(accountUser);
      console.log("NFTs del usuario: ", amountFromContract.toString());
      setAmount(amountFromContract.toString());
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  async function buytokens() {
    if (typeof window.ethereum !== "undefined") {
      if (BINANCENETWORK === network) {
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("cuenta conectada: ", account);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          genesisAddressContract,
          Genesis.abi,
          signer
        );

        try {
          const transaction = await contract.reserveTokens();
          console.log("Esperando compraOk");
          Swal.fire({
            title: "El proceso de compra ha comenzado",
            text: "No actualice la página",
            // icon: 'info',
            showConfirmButton: false,
            imageUrl:
              "https://thumbs.gfycat.com/ConventionalOblongFairybluebird-size_restricted.gif",
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "proceso de compra",
          });
          const compraOk = await transaction.wait();

          if (compraOk) {
            Swal.fire({
              title: `La cuenta ${account} ha reservado  TOPS`,
              html: `<a href="https://testnet.bscscan.com/tx/${transaction.hash}" target="_blank" rel="noreferrer">Hash de la transacción</a>`,
              icon: "success",
              //   confirmButtonText:  'Añadir contrato de Tops a su Metamask',
              //   confirmButtonClass: "btn btn-success",
              //   buttonsStyling: false,
              showCloseButton: true,
            });

            setAmount(0);
          }

          console.log(
            `La cuenta ${account}, ha recibido los Tops correctamente.`
          );
        } catch (err) {
          let mensajeError = err.message;

          if (err.data) {
            if (
              err.data.message ===
              "execution reverted: Esta cuenta no tiene permitida la reserva de Tops"
            ) {
              mensajeError =
                "Esta cuenta no tiene permitida la reserva de Tops";
            } else if (
              err.data.message ===
              "execution reverted: No es la cantidad acordada"
            ) {
              mensajeError = "No es la cantidad acordada";
            } else {
              mensajeError = "La transacción ha sido rechazada";
            }
          }

          Swal.fire({
            title: "Ooops!",
            text: `${mensajeError}`,
            icon: "error",
            confirmButtonText: "Cerrar",
          });
          console.log("Error: ", err);
        }
        conectionMetamask();
      }
    }
  }

  return (
    <div className="App">
      <main className="">
        <header className="mb-5">
          <nav className="d-flex justify-content-between align-items-center mx-3 my-3">
            <div>
              <a className="navbar-brand" href="https://topstars.app/">
                <img src="./logo192.png" height="70" alt="Logo de Tops" />
              </a>
            </div>
            <div>
              <button
                id="wallet"
                className="connectionMM btnHeader"
                onClick={conectionMetamask}
              >
                Connect Metamask
              </button>
              {/* {(i18n.language == "en") ? <a className="col-md-2" onClick={() => i18n.changeLanguage('es')}><img src="./img/es.png" alt="Español" /></a> : <a className="col-md-2" onClick={() => i18n.changeLanguage('en')}><img src="./img/en.png" alt="English" /></a>} */}
            </div>
          </nav>
        </header>
        <div className="App-container">
          <div className="App-buy my-3">
            <div className="block-buy-top-title">
              <h1>Genesis Card</h1>
              <p>VIP access at TopStars, with great benefits</p>
            </div>
            <div className="div-sustitucion">
              <div>
                <div className="container-buy-counter" id="form">
                  <div className="container-buy-genesis">
                    <div className="col-info-buy">
                      <div className="supply-genesis">{mint}/900</div>
                      <div className="genesis-minted">Genesis Card Minted</div>
                      <div className="col-mint">
                        <div className="mint-1">
                          <div className="mint-price">
                            <p>1 Genesis Card</p>
                            <p className="mint-price-2">Mint Price: $250</p>
                          </div>
                          <div className="btn-buy-genesis">
                            <button
                              id="wallet"
                              className="connectionMM btnHeader"
                              onClick={conectionMetamask}
                            >
                              Comprar
                            </button>
                          </div>
                        </div>
                        <div className="mint-2">
                          <div className="mint-price">
                            <p>2 Genesis Card</p>
                            <p className="mint-price-2">Mint Price: $400</p>
                          </div>
                          <div className="btn-buy-genesis">
                            <button
                              id="wallet"
                              className="connectionMM btnHeader"
                              onClick={conectionMetamask}
                            >
                              Comprar
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="genesis-wallet">
                        Genesis Card in your Wallet: {amount}
                      </div>
                    </div>
                    <div className="col-genesis">
                      <img
                        className="genesis-card"
                        src="https://v2.topstars.app/wp-content/uploads/2022/04/propuesta_horizontal_anverso_500.png"
                        alt="Genesis Card"
                      />
                    </div>
                  </div>
                  <div className="exclusive-benefits">
                    <h2>Exclusive Benefit</h2>
                    <div className="top-benefits">
                      <div className="col-top-benefits">
                        <h3>NFT TopStars Bronze Free</h3>
                        <img
                          className="nft-bronze"
                          src="https://topstars.app/wp-content/uploads/2021/12/bronze-nft.png"
                          alt="NFT TopStars Bronze"
                          width="200"
                        />
                        <p>1 per year (mint price $30)</p>
                      </div>
                      <div className="col-top-benefits">
                        <h3>Private Presale TOPS</h3>
                        <img
                          className="logoBlanco"
                          src="https://topstars.app/wp-content/uploads/elementor/thumbs/Simbolo_TopStars_Sombreado_Esfera-1-pf9vfmd9lb9nisv1m2mynotfmuuo3sws259yk3w1yg.png"
                          width="64"
                          height="64"
                          alt="Logo Tops"
                        />
                        <p>25% discount compared to TGE</p>
                      </div>
                      <div className="col-top-benefits">
                        <h3>NFT Topstars Purchase Priority</h3>
                        <img
                          className="nft-bronze"
                          src="https://topstars.app/wp-content/uploads/2022/04/reloj-de-pared.png"
                          alt="NFT TopStars Bronze"
                          width="64"
                        />
                        <p>First 12 hours of exclusive priority</p>
                      </div>
                      <div className="col-top-benefits">
                        <h3>Boosted Stake</h3>
                        <img
                          className="nft-bronze"
                          src="https://topstars.app/wp-content/uploads/2022/04/proof-of-stake.png"
                          alt="Stake TopStars"
                          width="64"
                        />
                        <p>Stake increased by x3</p>
                      </div>
                      <div className="col-top-benefits">
                        <h3>Mistery Box Free</h3>
                        <img
                          className="nft-bronze"
                          src="https://topstars.app/wp-content/uploads/2022/04/mistery.png"
                          alt="Mistery Box"
                          width="64"
                        />
                        <p>4 per year</p>
                      </div>
                      <div className="col-top-benefits">
                        <h3>Governance at TopStars</h3>
                        <img
                          className="nft-bronze"
                          src="https://topstars.app/wp-content/uploads/2022/04/voting-box.png"
                          alt="NFT TopStars Bronze"
                          width="64"
                        />
                        <p>Voting on corporate decisions</p>
                      </div>
                    </div>
                  </div>
                  <div className="benefits">
                    <h2>Benefit Comparison</h2>
                    <div className="table-benefits">
                      <div className="row header-table">
                        <div className="cell"></div>
                        <div className="cell">
                          <p className="table-title">Free</p>
                          <p className="table-subtitle">Fans</p>
                        </div>
                        <div className="cell">
                          <p className="table-title">NFT TopStars</p>
                          <p className="table-subtitle">Holders</p>
                        </div>
                        <div className="cell">
                          <p className="table-title">Genesis Card</p>
                          <p className="table-subtitle">VIP Membership</p>
                        </div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">NFT TopStars Bronze Free</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">1 per year (mint price $30)</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Private Presale TOPS</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">NFT TopStars Tier 2</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/marca-de-la-senal.png"
                            width="20"
                            height="20"
                            alt="Si"
                          />
                        </div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">NFT TopStars Priority</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">Second 12 hours of priority</div>
                        <div className="cell">
                          First 12 hours of exclusive priority
                        </div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Boosted Stake</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">Up to X3 (Uranium)</div>
                        <div className="cell">X3</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Mistery Box Free</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">Maximum 3 per year (Uranium)</div>
                        <div className="cell">4 per year</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Governance at TopStars</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/marca-de-la-senal.png"
                            width="20"
                            height="20"
                            alt="Si"
                          />
                        </div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Beta Testing</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/marca-de-la-senal.png"
                            width="20"
                            height="20"
                            alt="Si"
                          />
                        </div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Special Events</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/marca-de-la-senal.png"
                            width="20"
                            height="20"
                            alt="Si"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/marca-de-la-senal.png"
                            width="20"
                            height="20"
                            alt="Si"
                          />
                        </div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Private AMAs</div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/rechazado-no.png"
                            width="20"
                            height="20"
                            alt="No"
                          />
                        </div>
                        <div className="cell">
                          <img
                            src="https://topstars.app/wp-content/uploads/2022/03/marca-de-la-senal.png"
                            width="20"
                            height="20"
                            alt="Si"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="benefits-responsive">
                    <h2>Exclusive Benefits</h2>
                    <div className="table-benefits">
                      <div className="row header-table">
                        <div className="cell">
                          <p className="table-title">Genesis Card</p>
                          <p className="table-subtitle">VIP Membership</p>
                        </div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Private Presale TOPS</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">NFT TopStars Priority</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Boosted Stake</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Mistery Box Free</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Governance at TopStars</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Beta Testing</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Special Events</div>
                      </div>
                      <div className="row header-table">
                        <div className="cell">Private AMAs</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="partners">
                  <img
                    className="logoBinance"
                    src="https://topstars.app/wp-content/uploads/2022/01/new-binance-chain-logo-300x80_blanco.png"
                    width="101"
                    height="27"
                    alt="Logo Binance"
                  />
                  <img
                    className="logoBinance"
                    src="https://topstars.app/wp-content/uploads/2022/01/logo_diskover-blanco.png"
                    width="155"
                    height="27"
                    alt="Logo Binance"
                  />
                  <img
                    className="logoBinance"
                    src="https://v2.topstars.app/wp-content/uploads/2022/03/T_PMG_White_44.png"
                    width="110"
                    height="44"
                    alt="Logo Binance"
                  />
                  <img
                    className="logoBinance"
                    src="https://topstars.app/wp-content/uploads/2022/01/red-light_recorte_100.png"
                    width="100"
                    height="38"
                    alt="Logo Binance"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="App-footer">
        <a href="https://topstars.app/">
          <img
            className="logoBlanco"
            src="https://topstars.app/wp-content/uploads/elementor/thumbs/Simbolo_TopStars_Sombreado_Esfera-1-pf9vfmd9lb9nisv1m2mynotfmuuo3sws259yk3w1yg.png"
            width="64"
            height="64"
            alt="Logo Tops"
          />
        </a>
      </div>
    </div>
  );
}
export default App;
