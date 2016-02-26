import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
import org.w3c.dom.Element;
import java.io.File;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.StringJoiner;

public class XMLLangToJSON {
	private HashMap<String, String> defStrings;
	private HashMap<String, String> localStrings;

	public static void main(String argv[]) {
		XMLLangToJSON r = new XMLLangToJSON();
		if(argv.length != 2) {
			System.err.println("USAGE:  java XMLLangToJSON <<basefile.xml>> <<localizedfile-la.xml>>");
			System.exit(1);
		}

		try {
			r.readInDefaultFile(argv[0]);
			r.readInLocalFile(argv[1]);
			System.out.print(r.createJSONLocalizationString("pt"));
		} catch 	(Exception e) {
			e.printStackTrace();
			System.exit(1);
		}
	}

	/** 
	 * Must be escaped to get rid of " and such.
	 * http://stackoverflow.com/questions/3020094/how-should-i-escape-strings-in-json
	 */
	public static String quote(String string) {
		if (string == null || string.length() == 0) {
			return "\"\"";
		}

		char         c = 0;
		int          i;
		int          len = string.length();
		StringBuilder sb = new StringBuilder(len + 4);
		String       t;

		sb.append('"');
		for (i = 0; i < len; i += 1) {
			c = string.charAt(i);
			switch (c) {
			case '\\':
			case '"':
				sb.append('\\');
				sb.append(c);
				break;
			case '/':
 //                if (b == '<') {
				sb.append('\\');
 //                }
				sb.append(c);
				break;
			case '\b':
				sb.append("\\b");
				break;
			case '\t':
				sb.append("\\t");
				break;
			case '\n':
				sb.append("\\n");
				break;
			case '\f':
				sb.append("\\f");
				break;
			case '\r':
				sb.append("\\r");
				break;
			default:
				if (c < ' ') {
					t = "000" + Integer.toHexString(c);
					sb.append("\\u" + t.substring(t.length() - 4));
				} else {
					sb.append(c);
				}
			}
		}
		sb.append('"');
		return sb.toString();
    }

    /**
	 * Read the contents of the localized file into a HashMap with the keys being
	 * the ID, and the value being the localized text.
	 */
	public void readInLocalFile(String filename) throws Exception {
		localStrings = new HashMap<String, String>();
		File fXmlFile = new File(filename);
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
		Document doc = dBuilder.parse(fXmlFile);
			
		//optional, but recommended
		//read this - http://stackoverflow.com/questions/13786607/normalization-in-dom-parsing-with-java-how-does-it-work
		doc.getDocumentElement().normalize();

		NodeList nList = doc.getElementsByTagName("string");
				
		for (int temp = 0; temp < nList.getLength(); temp++) {

			Node nNode = nList.item(temp);
				
			if (nNode.getNodeType() == Node.ELEMENT_NODE) {
				Element eElement = (Element) nNode;
				localStrings.put(eElement.getAttribute("name"), eElement.getTextContent());
			}
		}
	}

	/**
	 * Read the contents of the default file (non-localized) into defStrings HashMap with key
	 * the VALUE OF THE STRING and value being the ID.  This seems BACKWARDS because we are 
	 * creating a way to quickly look up the ID from the passed in string to be localized.
	 * and the String will be used to look up the item in the localized file.
	 */
	public void readInDefaultFile(String filename) throws Exception {
		defStrings = new HashMap<String, String>();
		File fXmlFile = new File(filename);
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
		Document doc = dBuilder.parse(fXmlFile);
			
		//optional, but recommended
		//read this - http://stackoverflow.com/questions/13786607/normalization-in-dom-parsing-with-java-how-does-it-work
		doc.getDocumentElement().normalize();

		NodeList nList = doc.getElementsByTagName("string");
				
		for (int temp = 0; temp < nList.getLength(); temp++) {

			Node nNode = nList.item(temp);
				
			if (nNode.getNodeType() == Node.ELEMENT_NODE) {

				Element eElement = (Element) nNode;
				defStrings.put(eElement.getTextContent(), eElement.getAttribute("name"));
			}
		}
	}

	public String createJSONLocalizationString(String lang) {
		StringJoiner sj = new StringJoiner(",\n", "{\n", "\n}");
		for (String key : defStrings.keySet() ) {
			if(localStrings.get(defStrings.get(key)) != null) {
				sj.add("\t" + quote(key) + " : " + quote(localStrings.get(defStrings.get(key))));
			}
		}
		return(sj.toString());
	}
}